import { ethers } from "ethers";
import { getServerProvider } from "@/lib/blockchain/provider";

export async function verifyTransaction(txHash: string) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    throw new Error("Invalid transaction hash");
  }

  const provider = getServerProvider();
  const network = await provider.getNetwork();
  const expectedChainId = BigInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "11155111");

  if (network.chainId !== expectedChainId) {
    throw new Error(
      `Blockchain RPC chain ID mismatch: expected ${expectedChainId.toString()}, got ${network.chainId.toString()}`
    );
  }

  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    throw new Error("Transaction not found on the configured blockchain");
  }
  if (receipt.status !== 1) {
    throw new Error("Blockchain transaction failed");
  }

  const transaction = await provider.getTransaction(txHash);
  if (!transaction || transaction.hash.toLowerCase() !== txHash.toLowerCase()) {
    throw new Error("Transaction not found on the configured blockchain");
  }

  return { receipt, transaction };
}
