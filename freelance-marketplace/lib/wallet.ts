import { BrowserProvider } from "ethers"

export const connectWallet = async () => {
  if (typeof window === "undefined") {
    throw new Error("Window not available")
  }

  if (!(window as any).ethereum) {
    throw new Error("MetaMask not installed")
  }

  const provider = new BrowserProvider(
    (window as any).ethereum
  )

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
  if (!(window as any).ethereum) {
    return null
  }

  const provider = new BrowserProvider(
    (window as any).ethereum
  )

  const accounts = await provider.send(
    "eth_accounts",
    []
  )

  return accounts[0] || null
}