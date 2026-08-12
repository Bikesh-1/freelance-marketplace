import { BrowserProvider, Eip1193Provider } from "ethers"

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export const connectWallet = async () => {
  if (typeof window === "undefined") {
    throw new Error("Window not available")
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed")
  }

  const provider = new BrowserProvider(window.ethereum)

  await provider.send(
    "eth_requestAccounts",
    []
  )

  const signer = await provider.getSigner()
  const address = await signer.getAddress()

  return {
    provider,
    signer,
    address,
  }
}

export const getWalletAddress = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }

  const provider = new BrowserProvider(window.ethereum)

  const accounts = await provider.send(
    "eth_accounts",
    []
  )

  return accounts[0] || null
}