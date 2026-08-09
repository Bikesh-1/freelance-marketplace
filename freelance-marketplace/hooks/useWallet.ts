"use client"

import { useEffect, useState } from "react"
import axios from "axios"

import {
  connectWallet,
  getWalletAddress,
} from "@/lib/wallet"

export const useWallet = () => {
  const [walletAddress, setWalletAddress] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  useEffect(() => {
    getWalletAddress().then(
      setWalletAddress
    )
  }, [])

  const connect = async () => {
    try {
      setLoading(true)

      const { address } =
        await connectWallet()

      setWalletAddress(address)

      await axios.post(
        "/api/wallet/connect",
        {
          walletAddress: address,
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    setWalletAddress(null)
  }

  return {
    walletAddress,
    loading,
    connect,
    disconnect,
  }
}