"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { getBrowserProvider } from "@/lib/blockchain/provider";

export function useWalletSync() {
  const [address,setAddress,] = useState("");
  const [balance,setBalance,] = useState("0");

  useEffect(() => {
    const sync =
      async () => {
        try {
          const provider =getBrowserProvider();
          const signer =await provider.getSigner();
          const walletAddress =await signer.getAddress();
          const rawBalance =await provider.getBalance(walletAddress);
          setAddress(walletAddress);

          setBalance(ethers.formatEther(rawBalance));
        } catch (error) {
          console.error(error);
        }
      };

    sync();
  }, []);

  return {
    address,
    balance,
  };
}