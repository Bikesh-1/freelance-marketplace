"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { getBrowserProvider } from "@/lib/blockchain/provider";
import { getEscrowContract } from "@/lib/blockchain/escrow";

export function useEscrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Escrow on Blockchain + Save in Prisma
  const createEscrow = async (
    freelancerAddress: string,
    jobId: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider = getBrowserProvider();
      const signer = await provider.getSigner();
      const contract = getEscrowContract(signer);

      const tx = await contract.createEscrow(freelancerAddress);
      const receipt = await tx.wait();

      // Save escrow in database if jobId provided
      if (jobId) {
        await axios.post("/api/escrow/create", {
          jobId,
          contractAddress:
            process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
          amount: 0,
        });
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { shortMessage?: string; message?: string };

      setError(
        errorObj?.shortMessage ||
        errorObj?.message ||
        "Transaction failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fund Escrow + Sync Prisma
  const fundEscrow = async (
    escrowId: number,
    amount: string,
    prismaEscrowId: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider = getBrowserProvider();
      const signer = await provider.getSigner();
      const contract = getEscrowContract(signer);

      const value = ethers.parseEther(amount);

      const tx = await contract.fundEscrow(escrowId, {
        value,
      });

      const receipt = await tx.wait();

      if (prismaEscrowId) {
        await axios.post("/api/escrow/fund", {
          escrowId: prismaEscrowId,
          txHash: receipt.hash,
          amount: Number(amount),
          fromAddress: await signer.getAddress(),
          toAddress:
            process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
        });
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { shortMessage?: string; message?: string };

      setError(
        errorObj?.shortMessage ||
        errorObj?.message ||
        "Funding failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Release Payment + Sync Prisma
  const releasePayment = async (
    escrowId: number,
    prismaEscrowId: string = "",
    freelancerAddress: string = "",
    amount: number = 0
  ) => {
    try {
      setLoading(true);
      setError(null);

      const provider = getBrowserProvider();
      const signer = await provider.getSigner();
      const contract = getEscrowContract(signer);

      const tx = await contract.releasePayment(escrowId);
      const receipt = await tx.wait();

      if (prismaEscrowId) {
        await axios.post("/api/escrow/release", {
          escrowId: prismaEscrowId,
          txHash: receipt.hash,
          amount,
          fromAddress: await signer.getAddress(),
          toAddress: freelancerAddress,
        });
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { shortMessage?: string; message?: string };

      setError(
        errorObj?.shortMessage ||
        errorObj?.message ||
        "Payment release failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refund Escrow
  const refundPayment = async (
    escrowId: number,
    prismaEscrowId: string = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Connect wallet
      const provider = getBrowserProvider();
      const signer = await provider.getSigner();

      // 2. Load contract
      const contract = getEscrowContract(signer);

      // 3. Blockchain refund
      const tx = await contract.refundClient(escrowId);
      const receipt = await tx.wait();

      // 4. Sync database
      if (prismaEscrowId) {
        await axios.post("/api/dispute/refund", {
          escrowId: prismaEscrowId,
          txHash: receipt.hash,
        });
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { shortMessage?: string; message?: string };

      setError(
        errorObj?.shortMessage ||
        errorObj?.message ||
        "Refund failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAndFundEscrow = async (
  freelancerAddress: string,
  amount: string,
  prismaEscrowId: string = ""
) => {
  try {
    setLoading(true);
    setError(null);

    const provider = getBrowserProvider();
    const signer = await provider.getSigner();
    const contract = getEscrowContract(signer);

    // Next blockchain escrow ID
    const escrowIndex =
      Number(await contract.getEscrowCount());

    // Create escrow
    const createTx =
      await contract.createEscrow(
        freelancerAddress
      );

    await createTx.wait();

    // Fund escrow
    const value =
      ethers.parseEther(amount);

    const fundTx =
      await contract.fundEscrow(
        escrowIndex,
        {
          value,
        }
      );

    const receipt =
      await fundTx.wait();

    if (prismaEscrowId) {
      await axios.post(
        "/api/escrow/fund",
        {
          escrowId: prismaEscrowId,
          txHash: receipt.hash,
          amount: Number(amount),
          fromAddress:
            await signer.getAddress(),
          toAddress:
            process.env
              .NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
        }
      );
    }

    return {
      receipt,
      escrowIndex,
    };
  } catch (err: unknown) {
    console.error(err);

    const errorObj = err as {
      shortMessage?: string;
      message?: string;
    };

    setError(
      errorObj?.shortMessage ||
        errorObj?.message ||
        "Funding failed"
    );

    throw err;
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
    loading,
    error,
  };
}