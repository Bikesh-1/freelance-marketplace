import { BrowserProvider, Eip1193Provider } from "ethers";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const HARDHAT_CHAIN_ID = "0x7a69"; // 31337
const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

export function getBrowserProvider() {
  if (typeof window === "undefined") {
    throw new Error(
      "Browser provider can only be used on client"
    );
  }

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed"
    );
  }

  return new BrowserProvider(
    window.ethereum
  );
}

export async function switchToHardhatLocal() {
  if (typeof window === "undefined") {
    throw new Error(
      "Wallet can only be used in browser"
    );
  }

  if (!window.ethereum) {
    throw new Error(
      "MetaMask is not installed"
    );
  }

  try {
    // First try switching to Hardhat Local
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: HARDHAT_CHAIN_ID,
        },
      ],
    });
  } catch (error: unknown) {
    const err = error as {
      code?: number;
    };

    // 4902 = network does not exist
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HARDHAT_CHAIN_ID,
            chainName: "Hardhat Local",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              HARDHAT_RPC_URL,
            ],
          },
        ],
      });
    } else {
      throw error;
    }
  }

  const provider =
    new BrowserProvider(
      window.ethereum
    );

  const network =
    await provider.getNetwork();

  if (
    network.chainId !== 31337n
  ) {
    throw new Error(
      `Wrong network. Connected chain ID: ${network.chainId.toString()}`
    );
  }

  return provider;
}

export function getServerProvider() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;

  if (!rpcUrl) {
    throw new Error(
      "SEPOLIA_RPC_URL is not configured"
    );
  }

  return new ethers.JsonRpcProvider(
    rpcUrl
  );
}