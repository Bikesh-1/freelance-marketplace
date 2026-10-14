import { BrowserProvider, Eip1193Provider, ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const HARDHAT_CHAIN_ID = "0x7a69";
export const HARDHAT_CHAIN_ID_DECIMAL = 31337n;
export const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

export function getConfiguredChainId(): bigint {
  const raw = process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "31337";
  const chainId = BigInt(raw);
  if (chainId <= 0n) throw new Error("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID must be positive");
  return chainId;
}

export function getConfiguredRpcUrl(): string {
  return process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || HARDHAT_RPC_URL;
}

export function getBrowserProvider(): BrowserProvider {
  if (typeof window === "undefined") {
    throw new Error("Browser provider can only be used on client");
  }
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Kept under its existing name for compatibility with current imports.
 * The actual target chain is configurable through NEXT_PUBLIC_BLOCKCHAIN_*.
 */
export async function switchToHardhatLocal(): Promise<BrowserProvider> {
  if (typeof window === "undefined") {
    throw new Error("Wallet can only be used in browser");
  }
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const configuredChainId = getConfiguredChainId();
  const chainIdHex = `0x${configuredChainId.toString(16)}`;
  const rpcUrl = getConfiguredRpcUrl();
  const chainName = process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_NAME || "Hardhat Local";
  const currencySymbol = process.env.NEXT_PUBLIC_BLOCKCHAIN_CURRENCY_SYMBOL || "ETH";

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code !== 4902) throw error;

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: chainIdHex,
        chainName,
        nativeCurrency: { name: currencySymbol, symbol: currencySymbol, decimals: 18 },
        rpcUrls: [rpcUrl],
      }],
    });
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== configuredChainId) {
    throw new Error(`Wrong network. Connected chain ID: ${network.chainId.toString()}`);
  }
  return provider;
}

export function getServerProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || HARDHAT_RPC_URL;
  return new ethers.JsonRpcProvider(rpcUrl);
}
