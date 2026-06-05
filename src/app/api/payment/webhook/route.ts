import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Midtrans Payment Webhook
 * POST /api/payment/webhook
 *
 * Verifies signature, updates payment status, activates subscription
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      transaction_status,
      gross_amount,
      signature_key,
      fraud_status,
    } = body;

    // Verify Midtrans signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY not configured");
      return NextResponse.json(
        { success: false, error: { code: "INTERNAL_ERROR", message: "Server misconfigured" } },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${body.status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      return NextResponse.json(
        { success: false, error: { code: "PAYMENT_NOT_VERIFIED", message: "Invalid signature" } },
        { status: 403 }
      );
    }

    // Determine payment status
    let paymentStatus: "paid" | "failed" | "expired" | "pending" = "pending";

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "paid";
      }
    } else if (transaction_status === "deny" || transaction_status === "cancel") {
      paymentStatus = "failed";
    } else if (transaction_status === "expire") {
      paymentStatus = "expired";
    }

    // TODO: Update payment record in Supabase
    // TODO: If paid, activate subscription
    // TODO: Store raw_payload

    console.log(`Payment webhook: order=${order_id}, status=${paymentStatus}`);

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Webhook processing failed" } },
      { status: 500 }
    );
  }
}
