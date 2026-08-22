"use client";

import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

import { getBrowserProvider } from "@/lib/blockchain/provider";
import { getEscrowContract } from "@/lib/blockchain/escrow";

export function useEscrow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------------
  // CREATE ESCROW
  // --------------------------------------------------

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

      const tx =
        await contract.createEscrow(
          freelancerAddress
        );

      const receipt = await tx.wait();

      // Optional old escrow sync
      if (jobId) {
        await axios.post(
          "/api/escrow/create",
          {
            jobId,
            contractAddress:
              process.env
                .NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS,
            amount: 0,
          }
        );
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);

      const errorObj = err as {
        shortMessage?: string;
        message?: string;
      };

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

  // --------------------------------------------------
  // FUND EXISTING ESCROW
  // --------------------------------------------------

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

      const value =
        ethers.parseEther(amount);

      const tx =
        await contract.fundEscrow(
          escrowId,
          {
            value,
          }
        );

      const receipt = await tx.wait();

      // Sync existing Prisma escrow
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

      return receipt;
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

      const signer =
        await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      // Release payment on blockchain
      const tx =
        await contract.releasePayment(
          escrowId
        );

      // Wait for blockchain confirmation
      const receipt =
        await tx.wait();

      // Sync blockchain result with database
      await axios.post(
        "/api/escrow/release",
        {
          escrowId:
            prismaEscrowId,

          txHash:
            receipt.hash,

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
      console.error(err);

      const errorObj = err as {
        shortMessage?: string;
        message?: string;
      };

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

  // --------------------------------------------------
  // REFUND PAYMENT
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

      // Refund on blockchain
      const tx =
        await contract.refundClient(
          escrowId
        );

      const receipt =
        await tx.wait();

      // Sync database
      if (prismaEscrowId) {
        await axios.post(
          "/api/dispute/refund",
          {
            escrowId:
              prismaEscrowId,

            txHash:
              receipt.hash,
          }
        );
      }

      return receipt;
    } catch (err: unknown) {
      console.error(err);

      const errorObj = err as {
        shortMessage?: string;
        message?: string;
      };

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
        getBrowserProvider();

      const signer =
        await provider.getSigner();

      const contract =
        getEscrowContract(signer);

      // Get next blockchain escrow ID
      const escrowIndex =
        Number(
          await contract.getEscrowCount()
        );

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
    console.error(err);

    const errorObj = err as {
      shortMessage?: string;
      message?: string;
    };

    setError(
      errorObj?.shortMessage ||
        errorObj?.message ||
        "Admin release failed"
    );

    throw err;
  } finally {
    setLoading(false);
  }
};

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
    console.error(err);

    const errorObj = err as {
      shortMessage?: string;
      message?: string;
    };

    setError(
      errorObj?.shortMessage ||
        errorObj?.message ||
        "Admin refund failed"
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

  adminReleasePayment,
  adminRefundClient,

  loading,
  error,
};
}