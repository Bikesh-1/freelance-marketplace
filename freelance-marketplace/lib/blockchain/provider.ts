

import { BrowserProvider, ethers, type Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const DEFAULT_CHAIN_ID = 11155111n;
const DEFAULT_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

export function getConfiguredChainId(): bigint {
  const raw = process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "11155111";
  const chainId = BigInt(raw);

  if (chainId <= 0n) {
    throw new Error("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID must be positive");
  }

  return chainId;
}

export function getConfiguredRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ||
    DEFAULT_RPC_URL
  );
}

export function getBrowserProvider(): BrowserProvider {
  if (typeof window === "undefined") {
    throw new Error("Wallet provider can only be used in the browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new BrowserProvider(window.ethereum);
}

export async function switchToHardhatLocal(): Promise<BrowserProvider> {
  if (typeof window === "undefined") {
    throw new Error("Wallet can only be used in the browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const chainId = getConfiguredChainId();
  const chainIdHex = `0x${chainId.toString(16)}`;
  const rpcUrl = getConfiguredRpcUrl();

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    const walletError = error as { code?: number };

    if (walletError.code !== 4902) {
      throw error;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName:
            process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_NAME || "Sepolia",
          nativeCurrency: {
            name: "Sepolia Ether",
            symbol:
              process.env.NEXT_PUBLIC_BLOCKCHAIN_CURRENCY_SYMBOL || "ETH",
            decimals: 18,
          },
          rpcUrls: [rpcUrl],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        },
      ],
    });
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== chainId) {
    throw new Error(
      `Wrong network. Expected ${chainId.toString()}, connected to ${network.chainId.toString()}`
    );
  }

  return provider;
}

export function getServerProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL ||
    process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL ||
    DEFAULT_RPC_URL;

  return new ethers.JsonRpcProvider(rpcUrl);
}