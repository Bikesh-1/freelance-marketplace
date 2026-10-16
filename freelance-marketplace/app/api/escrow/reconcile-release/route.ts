import { ethers } from "ethers";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/blockchain/verifyTransaction";
import { getServerProvider } from "@/lib/blockchain/provider";
import { escrowAbi } from "@/lib/blockchain/escrowAbi";

function getNetworkLabel(chainId: bigint): string {
  if (chainId === 11155111n) return "sepolia";
  if (chainId === 31337n) return "hardhat-local";
  return `chain-${chainId.toString()}`;
}

/**
 * Reconciles a release transaction that already succeeded on-chain.
 * This endpoint verifies the receipt/event and updates the database only;
 * it does not submit a new blockchain transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ message: "Only clients can sync release payments" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const escrowId = typeof input.escrowId === "string" ? input.escrowId.trim() : "";
    const txHash = typeof input.txHash === "string" ? input.txHash.trim() : "";
    if (!escrowId || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ message: "A valid escrow ID and transaction hash are required" }, { status: 400 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, user: { select: { walletAddress: true } } },
    });
    if (!clientProfile) {
      return NextResponse.json({ message: "Client profile not found" }, { status: 404 });
    }
    if (!clientProfile.user.walletAddress) {
      return NextResponse.json({ message: "Connect the client wallet first" }, { status: 400 });
    }

    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        milestone: {
          include: {
            job: {
              include: {
                selectedFreelancer: { select: { user: { select: { walletAddress: true } } } },
              },
            },
          },
        },
      },
    });
    if (!escrow) {
      return NextResponse.json({ message: "Escrow not found" }, { status: 404 });
    }
    if (!escrow.milestone) {
      return NextResponse.json({ message: "Milestone escrow not found" }, { status: 404 });
    }
    if (escrow.milestone.job.clientId !== clientProfile.id) {
      return NextResponse.json({ message: "You do not have access to this escrow" }, { status: 403 });
    }
    if (
      (escrow.status !== "FUNDED" && escrow.status !== "RELEASED") ||
      (escrow.milestone.status !== "APPROVED" && escrow.milestone.status !== "RELEASED")
    ) {
      return NextResponse.json({ message: "Only an approved, funded or previously released escrow can be reconciled" }, { status: 409 });
    }
    if (escrow.blockchainEscrowId === null || !ethers.isAddress(escrow.contractAddress)) {
      return NextResponse.json({ message: "Escrow is missing its blockchain ID or contract address" }, { status: 409 });
    }

    const freelancerWallet = escrow.milestone.job.selectedFreelancer?.user.walletAddress;
    if (!freelancerWallet) {
      return NextResponse.json({ message: "Selected freelancer has no connected wallet" }, { status: 409 });
    }

    const { receipt, transaction, chainId } = await verifyTransaction(txHash);
    const network = getNetworkLabel(chainId);

    // The transaction may be sent through a wallet/router contract, so its
    // top-level "to" and calldata need not be the escrow contract/function.
    // Authenticate the initiating client here; the escrow-specific PaymentReleased
    // event and on-chain state below are the authoritative proof of this release.
    if (
      !transaction.to ||
      transaction.from.toLowerCase() !== clientProfile.user.walletAddress.toLowerCase()
    ) {
      return NextResponse.json({ message: "Transaction sender does not match this client" }, { status: 400 });
    }

    const iface = new ethers.Interface(escrowAbi);
    // Some already-deployed contract versions emitted a legacy four-field event:
    // PaymentReleased(uint256 indexed escrowId, address indexed freelancer,
    //                 address recipient, uint256 amount).
    // In that deployment the amount was accidentally encoded in the recipient
    // slot and the final amount slot was zero. Support that shape only when the
    // encoded value exactly matches this database escrow's expected wei amount.
    const legacyReleaseIface = new ethers.Interface([
      "event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, address recipient, uint256 amount)",
    ]);

    const releaseEvents = receipt.logs
      .filter((log) => log.address.toLowerCase() === escrow.contractAddress.toLowerCase())
      .map((log) => {
        try {
          const event = iface.parseLog({ topics: [...log.topics], data: log.data });
          if (event?.name === "PaymentReleased") return { event, legacy: false };
        } catch {
          // Try the legacy deployed event signature below.
        }
        try {
          const event = legacyReleaseIface.parseLog({ topics: [...log.topics], data: log.data });
          if (event?.name === "PaymentReleased") return { event, legacy: true };
        } catch {
          // Ignore unrelated logs from the escrow contract.
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Match the release event by recipient and amount first, then compare its
    // on-chain escrow ID with this database record. Never silently attach a
    // release for a different escrow to this record.
    const expectedAmountWei = ethers.parseEther(String(escrow.amount));
    const allowedDifferenceWei = ethers.parseEther("0.000001");
    const matchedRelease = releaseEvents.find(({ event, legacy }) => {
      if (event.args[1].toLowerCase() !== freelancerWallet.toLowerCase()) return false;
      const amountSlot = legacy
        ? (BigInt(event.args[3].toString()) > 0n
            ? BigInt(event.args[3].toString())
            : BigInt(event.args[2].toString()))
        : BigInt(event.args[2].toString());
      const difference = amountSlot >= expectedAmountWei
        ? amountSlot - expectedAmountWei
        : expectedAmountWei - amountSlot;
      return amountSlot > 0n && difference <= allowedDifferenceWei;
    });

    if (!matchedRelease) {
      return NextResponse.json({ message: "No release event for this freelancer with the expected escrow amount was found" }, { status: 400 });
    }

    const blockchainEscrowId = BigInt(matchedRelease.event.args[0].toString());
    if (blockchainEscrowId > BigInt(Number.MAX_SAFE_INTEGER)) {
      return NextResponse.json({ message: "The on-chain escrow ID is outside the supported range" }, { status: 400 });
    }
    if (blockchainEscrowId !== BigInt(escrow.blockchainEscrowId!)) {
      return NextResponse.json({
        message: `This transaction released on-chain escrow ${blockchainEscrowId.toString()}, but this database record is linked to escrow ${escrow.blockchainEscrowId}. Nothing was changed. Do not reuse this transaction for this escrow.`,
      }, { status: 409 });
    }

    let releaseAmountWei: bigint;
    if (matchedRelease.legacy) {
      const legacyAmount = BigInt(matchedRelease.event.args[3].toString());
      const legacyRecipientSlot = BigInt(matchedRelease.event.args[2].toString());
      // Correct legacy logs use args[3]. For the malformed historical event
      // shown by the explorer, args[3] is zero and args[2] contains the amount.
      releaseAmountWei = legacyAmount > 0n ? legacyAmount : legacyRecipientSlot;
    } else {
      releaseAmountWei = BigInt(matchedRelease.event.args[2].toString());
    }

    const differenceWei = releaseAmountWei >= expectedAmountWei
      ? releaseAmountWei - expectedAmountWei
      : expectedAmountWei - releaseAmountWei;

    if (releaseAmountWei <= 0n || differenceWei > allowedDifferenceWei) {
      return NextResponse.json({ message: "Released amount in the verified event does not match the escrow amount" }, { status: 400 });
    }
    const eventAmount = Number(ethers.formatEther(releaseAmountWei));

    // Check the contract's current state for this escrow and these parties.
    const chainContract = new ethers.Contract(escrow.contractAddress, escrowAbi, getServerProvider());
    const chainEscrow = await chainContract.getEscrow(blockchainEscrowId);
    if (
      chainEscrow[0].toLowerCase() !== clientProfile.user.walletAddress.toLowerCase() ||
      chainEscrow[1].toLowerCase() !== freelancerWallet.toLowerCase() ||
      Number(chainEscrow[3]) !== 2
    ) {
      return NextResponse.json({ message: "On-chain escrow parties or released status do not match" }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const escrowChanged = await tx.escrow.updateMany({
        where: { id: escrow.id, status: { in: ["FUNDED", "RELEASED"] } },
        data: { transactionHash: txHash, status: "RELEASED", network },
      });
      if (escrowChanged.count !== 1) throw new Error("ESCROW_STATUS_CHANGED");

      const milestoneChanged = await tx.milestone.updateMany({
        where: { id: escrow.milestone!.id, status: { in: ["APPROVED", "RELEASED"] } },
        data: { status: "RELEASED" },
      });
      if (milestoneChanged.count !== 1) throw new Error("MILESTONE_STATUS_CHANGED");

      const existingEscrowTx = await tx.escrowTransaction.findUnique({
        where: { transactionHash: txHash },
        select: { id: true, escrowId: true },
      });
      if (existingEscrowTx && existingEscrowTx.escrowId !== escrow.id) {
        throw new Error("TX_HASH_ALREADY_USED");
      }
      if (!existingEscrowTx) {
        await tx.escrowTransaction.create({
          data: {
            escrowId: escrow.id,
            type: "RELEASED",
            transactionHash: txHash,
            amount: eventAmount,
            fromAddress: transaction.from,
            toAddress: freelancerWallet,
            network,
          },
        });
      }

      const existingTransaction = await tx.transaction.findFirst({
        where: { txHash },
        select: { id: true, escrowId: true },
      });
      if (existingTransaction && existingTransaction.escrowId !== escrow.id) {
        throw new Error("TX_HASH_ALREADY_USED");
      }
      if (!existingTransaction) {
        await tx.transaction.create({
          data: {
            escrowId: escrow.id,
            txHash,
            amount: eventAmount,
            fromAddress: transaction.from,
            toAddress: freelancerWallet,
            network,
            status: "CONFIRMED",
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
          },
        });
      }

      return {
        escrow: await tx.escrow.findUnique({ where: { id: escrow.id } }),
        milestone: await tx.milestone.findUnique({ where: { id: escrow.milestone!.id } }),
      };
    });

    return NextResponse.json({
      success: true,
      message: "Successful blockchain payment verified and synced to the database",
      escrow: result.escrow,
      milestone: result.milestone,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reconcile release payment";
    if (message === "ESCROW_STATUS_CHANGED" || message === "MILESTONE_STATUS_CHANGED") {
      return NextResponse.json({ message: "Escrow or milestone status changed during reconciliation; refresh and retry" }, { status: 409 });
    }
    if (message === "TX_HASH_ALREADY_USED") {
      return NextResponse.json({ message: "This transaction hash is already linked to a different escrow" }, { status: 409 });
    }
    console.error("Reconcile release error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
