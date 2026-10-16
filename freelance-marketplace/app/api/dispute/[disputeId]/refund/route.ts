import { NextResponse } from "next/server";

/**
 * Refunds must go through POST /api/dispute/refund, which authenticates the
 * client and verifies the confirmed PaymentRefunded event on-chain.
 * This legacy dynamic route is intentionally disabled because it previously
 * marked escrow records as refunded without verifying a blockchain transaction.
 */
export async function POST() {
  return NextResponse.json(
    {
      message: "This legacy refund endpoint is disabled. Use the verified refund flow at /api/dispute/refund.",
    },
    { status: 410 },
  );
}
