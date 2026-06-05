import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMidtransAuthHeader, getMidtransBaseUrl, isProPlan, PRO_PLANS } from "@/lib/midtrans";

function err(code: string, message: string, status: number) {
  return NextResponse.json({ success: false, error: { code, message } }, { status });
}

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("UNAUTHORIZED", "Silakan login untuk upgrade.", 401);

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return err("VALIDATION_ERROR", "Request body tidak valid.", 400);
  }

  if (!body.plan || !isProPlan(body.plan)) {
    return err("VALIDATION_ERROR", "Plan tidak valid.", 400);
  }

  const plan = PRO_PLANS[body.plan];
  const orderId = `PPDS-${Date.now()}-${user.id.slice(0, 8)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: plan.amount,
    },
    item_details: [
      {
        id: body.plan,
        price: plan.amount,
        quantity: 1,
        name: plan.label,
      },
    ],
    customer_details: {
      email: user.email,
    },
    callbacks: {
      finish: `${appUrl}/payment/success?order_id=${orderId}`,
      error: `${appUrl}/payment/failed?order_id=${orderId}`,
      pending: `${appUrl}/payment/pending?order_id=${orderId}`,
    },
    enabled_payments: ["qris", "gopay", "bank_transfer"],
  };

  const response = await fetch(`${getMidtransBaseUrl()}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      Authorization: getMidtransAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const snap = await response.json();
  if (!response.ok) {
    return err("MIDTRANS_ERROR", "Gagal membuat transaksi Midtrans.", 502);
  }

  const admin = createAdminClient();
  const { error: paymentErr } = await admin.from("payments").insert({
    user_id: user.id,
    provider: "midtrans",
    order_id: orderId,
    amount: plan.amount,
    plan: body.plan,
    status: "pending",
    currency: "IDR",
    snap_token: snap.token,
    redirect_url: snap.redirect_url,
    raw_payload: snap,
  });

  if (paymentErr) {
    return err("INTERNAL_ERROR", "Transaksi dibuat, tapi gagal menyimpan payment.", 500);
  }

  return NextResponse.json({
    success: true,
    data: {
      order_id: orderId,
      token: snap.token,
      redirect_url: snap.redirect_url,
      amount: plan.amount,
      plan: body.plan,
    },
  });
}
