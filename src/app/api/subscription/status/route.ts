import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/subscription";

/**
 * GET /api/subscription/status
 * Returns the current user's PRO status (server-validated).
 */
export async function GET() {
  const status = await getSubscriptionStatus();

  return NextResponse.json({
    success: true,
    data: {
      is_pro: status.isPro,
      plan: status.plan,
      status: status.status,
      expires_at: status.expiresAt,
    },
  });
}
