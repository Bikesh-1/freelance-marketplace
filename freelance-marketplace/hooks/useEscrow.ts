"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import {getBrowserProvider,switchToHardhatLocal,} from "@/lib/blockchain/provider";
import { getEscrowContract } from "@/lib/blockchain/escrow";

export function useEscrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createEscrow = async (freelancerAddress: string,jobId: string = "") => {
    try {
      setLoading(true);
      setError(null);

      if (!ethers.isAddress(freelancerAddress)) {
        throw new Error("Invalid freelancer wallet address");
      }

      const provider = getBrowserProvider();
      const accounts = await provider.send("eth_accounts", []);

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect MetaMask first");
      }

      const signer = await provider.getSigner();
      const contract = getEscrowContract(signer);

      const tx = await contract.createEscrow(
        freelancerAddress
      );

      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error(
          "Escrow creation transaction failed"
        );
      }

      if (jobId) {
        await axios.post("/api/escrow/create", {
          jobId,
          contractAddress:process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
          amount: 0,
        });
      }

      return receipt;
    } catch (err: unknown) {
      console.error("Create escrow error:", err);

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Transaction failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const fundEscrow = async (
    escrowId: number,
    amount: string,
    prismaEscrowId: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!Number.isInteger(escrowId) ||escrowId < 0) {
        throw new Error("Invalid blockchain escrow ID");
      }

      if (!amount || Number(amount) <= 0) {
        throw new Error("Invalid escrow amount");
      }

      const provider = getBrowserProvider();

      const accounts = await provider.send("eth_accounts",[]);

      if (!accounts || accounts.length === 0) {
        throw new Error("Please connect MetaMask first");
      }

      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const contract = getEscrowContract(signer);

      const escrow = await contract.getEscrow(escrowId);

      const clientAddress = escrow[0];
      const freelancerAddress = escrow[1];
      const blockchainAmount = escrow[2];
      const status = Number(escrow[3]);

      console.log("Escrow before funding:", {
        escrowId,
        clientAddress,
        freelancerAddress,
        blockchainAmount:
          ethers.formatEther(blockchainAmount),
        status,
        signerAddress,
      });

      if (clientAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("Connected wallet is not the escrow client");
      }

      if (status !== 0) {
        throw new Error(`Escrow cannot be funded. Current blockchain status: ${status}`);
      }

      const value = ethers.parseEther(amount);
      await contract.fundEscrow.staticCall(
        escrowId,
        {
          value,
        }
      );

      console.log("Funding transaction simulation passed");

      const tx = await contract.fundEscrow(escrowId,{
          value,
        }
      );

      console.log("Funding transaction sent:",tx.hash);

      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error("Funding transaction failed");
      }

      console.log("Funding transaction confirmed:",receipt.hash);

      if (prismaEscrowId) {
        await axios.post("/api/escrow/fund",
          {
            escrowId: prismaEscrowId,
            txHash: receipt.hash,
            amount: Number(amount),
            fromAddress: signerAddress,
            toAddress:process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
          }
        );
      }

      return receipt;
    } catch (err: unknown) {
      console.error("Fund escrow error:", err);

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Funding failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CREATE + FUND ESCROW
  // --------------------------------------------------

  const createAndFundEscrow = async (
    freelancerAddress: string,
    amount: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!freelancerAddress) {
        throw new Error(
          "Freelancer wallet address is required"
        );
      }

      if (!amount || Number(amount) <= 0) {
        throw new Error(
          "Invalid escrow amount"
        );
      }

      const provider =
  await switchToHardhatLocal();

const signer =
  await provider.getSigner();

      // Make sure MetaMask is on Sepolia
      const network =
        await provider.getNetwork();

      

      const contract =
        getEscrowContract(signer);

      /*
       * ----------------------------------------
       * STEP 1: CREATE ESCROW
       * ----------------------------------------
       */

      const createTx =
        await contract.createEscrow(
          freelancerAddress
        );

      console.log(
        "Create escrow tx:",
        createTx.hash
      );

      const createReceipt =
        await createTx.wait();

      if (!createReceipt) {
        throw new Error(
          "Escrow creation transaction failed"
        );
      }

      /*
       * ----------------------------------------
       * GET REAL ESCROW ID FROM EVENT
       * ----------------------------------------
       */

      let escrowIndex: number | null = null;

      for (
        const log of createReceipt.logs
      ) {
        try {
          const parsed =
            contract.interface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });

          if (
            parsed &&
            parsed.name === "EscrowCreated"
          ) {
            escrowIndex = Number(
              parsed.args[0]
            );

            break;
          }
        } catch {
          // Ignore unrelated logs
        }
      }

      if (
        escrowIndex === null
      ) {
        throw new Error(
          "Could not find blockchain escrow ID from EscrowCreated event."
        );
      }

      console.log(
        "Blockchain escrow ID:",
        escrowIndex
      );

      /*
       * ----------------------------------------
       * STEP 2: FUND ESCROW
       * ----------------------------------------
       */

      const value =
        ethers.parseEther(amount);

      const fundTx =
        await contract.fundEscrow(
          escrowIndex,
          {
            value,
          }
        );

      console.log(
        "Fund escrow tx:",
        fundTx.hash
      );

      const fundReceipt =
        await fundTx.wait();

      if (!fundReceipt) {
        throw new Error(
          "Funding transaction failed"
        );
      }

      return {
        receipt: fundReceipt,
        escrowIndex,
        createReceipt,
        createTxHash: createTx.hash,
        fundTxHash: fundTx.hash,
      };
    } catch (err: unknown) {
      console.error(
        "createAndFundEscrow error:",
        err
      );

      const errorObj =
        err as {
          shortMessage?: string;
          message?: string;
        };

      const message =
        errorObj?.shortMessage ||
        errorObj?.message ||
        "Funding failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RELEASE PAYMENT
  // --------------------------------------------------

  const releasePayment = async (
    escrowId: number,
    prismaEscrowId: string,
    freelancerAddress: string,
    amount: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!prismaEscrowId) {
        throw new Error(
          "Prisma escrow ID is required"
        );
      }

      if (!freelancerAddress) {
        throw new Error(
          "Freelancer wallet address is required"
        );
      }

      const provider = getBrowserProvider();
      const signer = await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      const tx =
        await contract.releasePayment(
          escrowId
        );

      const receipt =
        await tx.wait();

      if (!receipt) {
        throw new Error(
          "Payment release transaction failed"
        );
      }

      await axios.post(
        "/api/escrow/release",
        {
          escrowId: prismaEscrowId,
          txHash: receipt.hash,
          amount,
          fromAddress:
            await signer.getAddress(),
          toAddress:
            freelancerAddress,
        }
      );

      return {
        receipt,
      };
    } catch (err: unknown) {
      console.error(
        "Release payment error:",
        err
      );

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Payment release failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // REFUND
  // --------------------------------------------------

  const refundPayment = async (
    escrowId: number,
    prismaEscrowId: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider =
        getBrowserProvider();

      const signer =
        await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      const tx =
        await contract.refundClient(
          escrowId
        );

      const receipt =
        await tx.wait();

      if (!receipt) {
        throw new Error(
          "Refund transaction failed"
        );
      }

      if (prismaEscrowId) {
        await axios.post(
          "/api/dispute/refund",
          {
            escrowId: prismaEscrowId,
            txHash: receipt.hash,
          }
        );
      }

      return receipt;
    } catch (err: unknown) {
      console.error(
        "Refund error:",
        err
      );

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Refund failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ADMIN RELEASE
  // --------------------------------------------------

  const adminReleasePayment = async (
    escrowId: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider =
        getBrowserProvider();

      const signer =
        await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      const tx =
        await contract.adminReleasePayment(
          escrowId
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: unknown) {
      console.error(
        "Admin release error:",
        err
      );

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Admin release failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // ADMIN REFUND
  // --------------------------------------------------

  const adminRefundClient = async (
    escrowId: number
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider =
        getBrowserProvider();

      const signer =
        await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      const tx =
        await contract.adminRefundClient(
          escrowId
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: unknown) {
      console.error(
        "Admin refund error:",
        err
      );

      const errorObj = err as {
        shortMessage?: string;
        reason?: string;
        message?: string;
      };

      const message =
        errorObj.shortMessage ||
        errorObj.reason ||
        errorObj.message ||
        "Admin refund failed";

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    createEscrow,
    fundEscrow,
    releasePayment,
    refundPayment,
    createAndFundEscrow,

    adminReleasePayment,
    adminRefundClient,

    loading,
    error,
  };
}