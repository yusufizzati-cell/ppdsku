import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { addDays, getMidtransApiBaseUrl, getMidtransAuthHeader, isProPlan, PRO_PLANS } from "@/lib/midtrans";

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

function mapMidtransStatus(transactionStatus?: string, fraudStatus?: string) {
  if (transactionStatus === "capture") return fraudStatus === "challenge" ? "pending" : "paid";
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (["deny", "cancel", "expire", "failure"].includes(transactionStatus ?? "")) {
    return transactionStatus === "expire" ? "expired" : transactionStatus === "cancel" ? "cancelled" : "failed";
  }
  return "pending";
}

function isSignatureValid(payload: Record<string, string>) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !payload.signature_key) return false;
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return expected === payload.signature_key;
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!isSignatureValid(payload)) {
    return NextResponse.json({ success: false, error: "invalid signature" }, { status: 401 });
  }

  const orderId = payload.order_id as string;
  const verifyResponse = await fetch(`${getMidtransApiBaseUrl()}/v2/${orderId}/status`, {
    headers: { Authorization: getMidtransAuthHeader(), Accept: "application/json" },
  });
  const verified = verifyResponse.ok ? await verifyResponse.json() : payload;
  const status = mapMidtransStatus(verified.transaction_status, verified.fraud_status);

  const admin = createAdminClient();
  const { data: payment, error: paymentFetchErr } = await admin
    .from("payments")
    .select("id, user_id, plan")
    .eq("order_id", orderId)
    .maybeSingle();

  if (paymentFetchErr || !payment) {
    return NextResponse.json({ success: false, error: "payment not found" }, { status: 404 });
  }

  await admin
    .from("payments")
    .update({
      status,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      payment_type: verified.payment_type ?? null,
      fraud_status: verified.fraud_status ?? null,
      transaction_id: verified.transaction_id ?? null,
      raw_payload: verified,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (status === "paid" && isProPlan(payment.plan)) {
    const now = new Date();
    const expiresAt = addDays(now, PRO_PLANS[payment.plan].durationDays);
    await admin.from("subscriptions").insert({
      user_id: payment.user_id,
      payment_id: payment.id,
      plan: payment.plan,
      status: "active",
      started_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      midtrans_order_id: orderId,
    });
  }

  return NextResponse.json({ success: true });
}
