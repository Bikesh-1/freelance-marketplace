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

      // Read the browser wallet without auto-linking it to the
      // signed-in account. Linking is an explicit user action.
      // Only show it as connected when it matches the account saved on this app.
      const { data } = await axios.get("/api/wallet/summary").catch(() => ({ data: null }));
      const linkedAddress = typeof data?.walletAddress === "string" ? data.walletAddress : null;
      setWalletAddress(
        address && linkedAddress && address.toLowerCase() === linkedAddress.toLowerCase()
          ? linkedAddress
          : null
      );
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

      // Do not silently link the currently selected MetaMask account.
      // The user can explicitly connect it from the button.
      const { data } = await axios.get("/api/wallet/summary").catch(() => ({ data: null }));
      const linkedAddress = typeof data?.walletAddress === "string" ? data.walletAddress : null;
      setWalletAddress(
        address && linkedAddress && address.toLowerCase() === linkedAddress.toLowerCase()
          ? linkedAddress
          : null
      );
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

    const address = addresses[0];
    // Track the selected account, but do not confuse it with the wallet
    // already linked to this logged-in account.
    try {
      const { data } = await axios.get("/api/wallet/summary");
      const linkedAddress = typeof data?.walletAddress === "string" ? data.walletAddress : null;
      setWalletAddress(
        linkedAddress && address.toLowerCase() === linkedAddress.toLowerCase()
          ? linkedAddress
          : null
      );
    } catch (error) {
      console.error("Wallet status refresh error:", error);
      setWalletAddress(null);
    }
    setError(null);
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

      const response = await axios.post(
        "/api/wallet/connect",
        { walletAddress: address }
      );
      setWalletAddress(response.data.walletAddress ?? address);
    } catch (error: unknown) {
      console.error(
        "Wallet connection error:",
        error
      );

      const message = axios.isAxiosError(error)
        ? (typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : error.response?.status === 409
              ? "This wallet is already linked to another account. Disconnect it from that account first, or choose another wallet."
              : error.message || "Failed to connect wallet")
        : error instanceof Error
          ? error.message
          : "Failed to connect wallet";

      setError(message);
      // Keep the error in component state instead of creating an
      // unhandled promise rejection in the click handler.
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