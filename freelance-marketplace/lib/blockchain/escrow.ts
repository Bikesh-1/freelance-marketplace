import { ethers } from "ethers";
import { escrowAbi } from "./escrowAbi";

// Keep environment validation out of module scope: Next.js may import this
// module while prerendering pages that do not actually use the blockchain.
const configuredContractAddress =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS?.trim();

export const ESCROW_CONTRACT_ADDRESS =
  configuredContractAddress && ethers.isAddress(configuredContractAddress)
    ? ethers.getAddress(configuredContractAddress)
    : "";

export function getEscrowContract(
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  if (!configuredContractAddress) {
    throw new Error("NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS is missing");
  }

  if (!ethers.isAddress(configuredContractAddress)) {
    throw new Error("Invalid escrow contract address");
  }

  return new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    escrowAbi,
    signerOrProvider
  );
}
