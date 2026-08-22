import { ethers } from "ethers";

import { getServerProvider } from "@/lib/blockchain/provider";

export async function verifyTransaction(
  txHash: string
) {
  const provider =
    getServerProvider();

  const receipt =
    await provider.getTransactionReceipt(
      txHash
    );

  if (!receipt) {
    throw new Error(
      "Transaction not found on blockchain"
    );
  }

  if (receipt.status !== 1) {
    throw new Error(
      "Blockchain transaction failed"
    );
  }

  const transaction =
    await provider.getTransaction(
      txHash
    );

  if (!transaction) {
    throw new Error(
      "Transaction not found"
    );
  }

  return {
    receipt,
    transaction,
  };
}