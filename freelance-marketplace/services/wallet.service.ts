import axios from "axios";

export async function getWalletSummary(
  userId: string
) {
  const { data } =
    await axios.get(
      `/api/wallet/summary?userId=${userId}`
    );

  return data;
}

export async function getWalletTransactions(
  userId: string
) {
  const { data } =
    await axios.get(
      `/api/wallet/transactions?userId=${userId}`
    );

  return data.transactions;
}