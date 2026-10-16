import { ethers } from "ethers";
import { escrowAbi } from "./escrowAbi";

const contractAddress =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS;

if (!contractAddress) {
  throw new Error("NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS is missing");
}

if (!ethers.isAddress(contractAddress)) {
  throw new Error("Invalid escrow contract address");
}

export const ESCROW_CONTRACT_ADDRESS = ethers.getAddress(contractAddress);

export function getEscrowContract(
  signerOrProvider: ethers.Signer | ethers.Provider
) {
  return new ethers.Contract(
    ESCROW_CONTRACT_ADDRESS,
    escrowAbi,
    signerOrProvider
  );
}