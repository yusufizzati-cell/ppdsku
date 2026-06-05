import { NextRequest, NextResponse } from "next/server";

/**
 * Create Payment
 * POST /api/payment/create
 *
 * Generates Midtrans transaction for QRIS payment
 */

const PLANS = {
  pro_monthly: { amount: 49000, label: "Pro Monthly", days: 30 },
  pro_3month: { amount: 99000, label: "Pro 3 Bulan", days: 90 },
  pro_6month: { amount: 149000, label: "Pro 6 Bulan", days: 180 },
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    // Validate plan
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid plan selected" },
        },
        { status: 400 }
      );
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];

    // TODO: Verify user session from Supabase
    // TODO: Generate order_id server-side
    // TODO: Create payment record in DB
    // TODO: Call Midtrans API to create transaction

    const orderId = `PPDS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      data: {
        payment: {
          order_id: orderId,
          provider: "midtrans",
          amount: planConfig.amount,
          status: "pending",
        },
        // Placeholder - will be replaced with actual Midtrans response
        midtrans: {
          token: "placeholder-token",
          redirect_url: null,
          qr_string: null,
        },
        redirect_to: `/payment/pending?order_id=${orderId}`,
      },
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "PAYMENT_ERROR", message: "Failed to create payment" },
      },
      { status: 500 }
    );
  }
}
