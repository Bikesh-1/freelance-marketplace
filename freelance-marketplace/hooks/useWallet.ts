"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import {
  connectWallet,
  getWalletAddress,
} from "@/lib/wallet";

import {
  getWalletSummary,
  getWalletTransactions,
} from "@/services/wallet.service";

export function useWalletConnection() {
  const [walletAddress, setWalletAddress] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncWallet = useCallback(async () => {
    try {
      const address = await getWalletAddress();

      setWalletAddress(address);

      // MetaMask disconnected / no account
      if (!address) {
        return;
      }

      // Always sync currently selected MetaMask account
      await axios.post("/api/wallet/connect", {
        walletAddress: address,
      });
    } catch (error) {
      console.error("Wallet sync error:", error);
    }
  }, []);

useEffect(() => {
  let mounted = true;

  const initializeWallet = async () => {
    try {
      const address =
        await getWalletAddress();

      if (!mounted) return;

      setWalletAddress(address);

      if (address) {
        await axios.post(
          "/api/wallet/connect",
          {
            walletAddress: address,
          }
        );
      }
    } catch (error) {
      console.error(
        "Initial wallet sync error:",
        error
      );
    }
  };

  // Run asynchronously so React does not
  // treat this as a synchronous effect update.
  void initializeWallet();

  if (
    typeof window === "undefined" ||
    !window.ethereum
  ) {
    return () => {
      mounted = false;
    };
  }

  const ethereum =
    window.ethereum as {
      on?: (
        event: string,
        listener: (...args: unknown[]) => void
      ) => void;

      removeListener?: (
        event: string,
        listener: (...args: unknown[]) => void
      ) => void;
    };

  const handleAccountsChanged = async (
    accounts: unknown
  ) => {
    const addresses =
      accounts as string[];

    if (!addresses?.length) {
      setWalletAddress(null);

      try {
        await axios.post(
          "/api/wallet/disconnect"
        );
      } catch (error) {
        console.error(
          "Wallet disconnect sync error:",
          error
        );
      }

      return;
    }

    const address =
      addresses[0];

    setWalletAddress(address);

    try {
      await axios.post(
        "/api/wallet/connect",
        {
          walletAddress: address,
        }
      );
    } catch (error) {
      console.error(
        "Account change sync error:",
        error
      );
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  ethereum.on?.(
    "accountsChanged",
    handleAccountsChanged
  );

  ethereum.on?.(
    "chainChanged",
    handleChainChanged
  );

  return () => {
    mounted = false;

    ethereum.removeListener?.(
      "accountsChanged",
      handleAccountsChanged
    );

    ethereum.removeListener?.(
      "chainChanged",
      handleChainChanged
    );
  };
}, []);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);

      const { address } =
        await connectWallet();

      setWalletAddress(address);

      await axios.post(
        "/api/wallet/connect",
        {
          walletAddress: address,
        }
      );
    } catch (error: unknown) {
      console.error(
        "Wallet connection error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect wallet";

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        "/api/wallet/disconnect"
      );

      setWalletAddress(null);
    } catch (error: unknown) {
      console.error(
        "Wallet disconnect error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Failed to disconnect wallet";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    walletAddress,
    loading,
    error,
    connect,
    disconnect,
    refresh: syncWallet,
  };
}

export function useWallet(userId: string) {
  return useQuery({
    queryKey: ["wallet",userId,],
    queryFn: () => getWalletSummary(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}

export function useWalletTransactions(userId: string) {
  return useQuery({
    queryKey: ["wallet-transactions",userId,],
    queryFn: () =>getWalletTransactions(),
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
}