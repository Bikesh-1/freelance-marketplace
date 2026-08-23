import axios from "axios";

export async function getEscrowTransactions(
  escrowId: string
) {
  const { data } =
    await axios.get(
      `/api/escrow/${escrowId}/transactions`
    );

  return data.transactions;
}