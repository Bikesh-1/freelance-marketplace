import { BrowserProvider, Eip1193Provider } from "ethers";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

function getConfiguredChainId(): bigint {
  const chainId = BigInt(process.env.NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID || "31337");
  if (chainId <= 0n) throw new Error("NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID must be positive");
  return chainId;
}

export const connectWallet = async () => {
  if (typeof window === "undefined") {
    throw new Error("Window not available");
  }
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();
  const expectedChainId = getConfiguredChainId();
  if (network.chainId !== expectedChainId) {
    throw new Error(
      `Please connect MetaMask to the configured network (chain ID ${expectedChainId.toString()})`
    );
  }

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
};

export const getWalletAddress = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  return accounts?.[0] ?? null;
};
