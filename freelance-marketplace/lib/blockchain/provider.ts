import { BrowserProvider, Eip1193Provider } from "ethers";
import { ethers } from "ethers";

export function getBrowserProvider() {
  if (typeof window === "undefined") {
    throw new Error(
      "Browser provider can only be used on client"
    );
  }

  const ethereum = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;

  if (!ethereum) {
    throw new Error(
      "MetaMask is not installed"
    );
  }

  return new BrowserProvider(ethereum);
}

export function getServerProvider() {
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error(
      "SEPOLIA_RPC_URL is not configured"
    );
  }

  return new ethers.JsonRpcProvider(
    rpcUrl
  );
}