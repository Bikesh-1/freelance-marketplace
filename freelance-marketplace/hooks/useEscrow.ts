"use client";

import { useState } from "react";
import { ethers } from "ethers";

import { getBrowserProvider } from "@/lib/blockchain/provider";
import { getEscrowContract } from "@/lib/blockchain/escrow";

export function useEscrow() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const createEscrow = async (
    freelancerAddress: string
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
        await contract.createEscrow(
          freelancerAddress
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.shortMessage ||
          err?.message ||
          "Transaction failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fundEscrow = async (
    escrowId: number,
    amount: string
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

      const value =
        ethers.parseEther(amount);

      const tx =
        await contract.fundEscrow(
          escrowId,
          {
            value,
          }
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.shortMessage ||
          err?.message ||
          "Funding failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const releasePayment = async (
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
        await contract.releasePayment(
          escrowId
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.shortMessage ||
          err?.message ||
          "Payment release failed"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (
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
        await contract.refundClient(
          escrowId
        );

      const receipt =
        await tx.wait();

      return receipt;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.shortMessage ||
          err?.message ||
          "Refund failed"
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
    loading,
    error,
  };
}