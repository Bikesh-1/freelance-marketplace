import { BrowserProvider, Eip1193Provider } from "ethers";

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