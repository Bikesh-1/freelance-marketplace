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

    const releasedEvent = receipt.logs
      .filter((log) => log.address.toLowerCase() === escrow.contractAddress.toLowerCase())
      .map((log) => {
        try { return iface.parseLog({ topics: [...log.topics], data: log.data }); }
        catch { return null; }
      })
      .find((event) =>
        event?.name === "PaymentReleased" &&
        BigInt(event.args[0].toString()) === BigInt(escrow.blockchainEscrowId!) &&
        event.args[1].toLowerCase() === freelancerWallet.toLowerCase()
      );

    if (!releasedEvent) {
      return NextResponse.json({ message: "PaymentReleased event for this freelancer was not found" }, { status: 400 });
    }

    const eventAmount = Number(ethers.formatEther(releasedEvent.args[2]));
    if (!Number.isFinite(eventAmount) || Math.abs(eventAmount - escrow.amount) > 0.000001) {
      return NextResponse.json({ message: "Released amount does not match the escrow amount" }, { status: 400 });
    }

    // Check the contract's current state for this escrow and these parties.
    const chainContract = new ethers.Contract(escrow.contractAddress, escrowAbi, getServerProvider());
    const chainEscrow = await chainContract.getEscrow(escrow.blockchainEscrowId);
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
