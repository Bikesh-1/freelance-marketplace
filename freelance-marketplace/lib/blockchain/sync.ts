import { prisma } from "@/lib/prisma";

export async function logBlockchainEvent(
  eventName: string,
  txHash: string,
  blockNumber: bigint,
  payload: any
) {
  await prisma.blockchainEvent.create({
    data: {
      eventName,
      txHash,
      blockNumber:
        Number(blockNumber),
      network: "hardhat-local",
      payload,
    },
  });
}