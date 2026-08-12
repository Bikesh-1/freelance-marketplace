"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  connectWallet,
  getWalletAddress,
} from "@/lib/wallet";

import {
  getWalletSummary,
  getWalletTransactions,
} from "@/services/wallet.service";

// MetaMask connect / disconnect
export function useWalletConnection() {
  const [
    walletAddress,
    setWalletAddress,
  ] = useState<
    string | null
  >(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    getWalletAddress().then(
      setWalletAddress
    );
  }, []);

  const connect =
    async () => {
      try {
        setLoading(true);

        const {
          address,
        } =
          await connectWallet();

        setWalletAddress(
          address
        );

        await axios.post(
          "/api/wallet/connect",
          {
            walletAddress:
              address,
          }
        );
      } finally {
        setLoading(false);
      }
    };

  const disconnect = () => {
    setWalletAddress(null);
  };

  return {
    walletAddress,
    loading,
    connect,
    disconnect,
  };
}

// Wallet summary
export function useWallet(
  userId: string
) {
  return useQuery({
    queryKey: [
      "wallet",
      userId,
    ],
    queryFn: () =>
      getWalletSummary(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

// Wallet transactions
export function useWalletTransactions(
  userId: string
) {
  return useQuery({
    queryKey: [
      "wallet-transactions",
      userId,
    ],
    queryFn: () =>
      getWalletTransactions(userId),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}