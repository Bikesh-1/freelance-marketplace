import { BrowserProvider, Eip1193Provider, ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export const HARDHAT_CHAIN_ID = "0x7a69";
export const HARDHAT_CHAIN_ID_DECIMAL = 31337n;
export const HARDHAT_RPC_URL = "http://127.0.0.1:8545";

export function getBrowserProvider(): BrowserProvider {
  if (typeof window === "undefined") {
    throw new Error("Browser provider can only be used on client");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  return new BrowserProvider(window.ethereum);
}

export async function switchToHardhatLocal(): Promise<BrowserProvider> {
  if (typeof window === "undefined") {
    throw new Error("Wallet can only be used in browser");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: HARDHAT_CHAIN_ID,
        },
      ],
    });
  } catch (error: unknown) {
    const err = error as { code?: number };

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
            rpcUrls: [HARDHAT_RPC_URL],
          },
        ],
      });
    } else {
      throw error;
    }
  }

  const provider = new BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();

  if (network.chainId !== HARDHAT_CHAIN_ID_DECIMAL) {
    throw new Error(
      `Wrong network. Connected chain ID: ${network.chainId.toString()}`
    );
  }

  return provider;
}

export function getServerProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
}