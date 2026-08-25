import axios from "axios";

export async function getWalletSummary() {
  const { data } = await axios.get(
    "/api/wallet/summary"
  );

  return data;
}

export async function getWalletTransactions() {
  const { data } = await axios.get(
    "/api/wallet/transactions"
  );

  return data.transactions;
}