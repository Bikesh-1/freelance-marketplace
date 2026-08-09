import { ethers } from "ethers";

export function getBrowserProvider() {
  if (typeof window === "undefined") {
    throw new Error(
      "Browser provider can only be used on client"
    );
  }

  const ethereum = (
    window as any
  ).ethereum;

  if (!ethereum) {
    throw new Error(
      "MetaMask is not installed"
    );
  }

  return new ethers.BrowserProvider(
    ethereum
  );
}