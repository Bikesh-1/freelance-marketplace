import {
  BrowserProvider,
  Eip1193Provider,
} from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const HARDHAT_CHAIN_ID = 31337n;

export const connectWallet =
  async () => {
    if (
      typeof window === "undefined"
    ) {
      throw new Error(
        "Window not available"
      );
    }

    if (!window.ethereum) {
      throw new Error(
        "MetaMask is not installed"
      );
    }

    const provider =
      new BrowserProvider(
        window.ethereum
      );

    await provider.send(
      "eth_requestAccounts",
      []
    );

    const network =
      await provider.getNetwork();

    if (
      network.chainId !==
      HARDHAT_CHAIN_ID
    ) {
      throw new Error(
        "Please connect MetaMask to Hardhat Local network"
      );
    }

    const signer =
      await provider.getSigner();

    const address =
      await signer.getAddress();

    return {
      provider,
      signer,
      address,
    };
  };

export const getWalletAddress =
  async () => {
    if (
      typeof window === "undefined" ||
      !window.ethereum
    ) {
      return null;
    }

    const provider =
      new BrowserProvider(
        window.ethereum
      );

    const accounts =
      await provider.send(
        "eth_accounts",
        []
      );

    return accounts?.[0] ?? null;
  };