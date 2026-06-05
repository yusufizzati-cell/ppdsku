export type ProPlan = "pro_monthly" | "pro_3month" | "pro_6month";

export const PRO_PLANS: Record<ProPlan, { label: string; amount: number; durationDays: number }> = {
  pro_monthly: { label: "PRO Bulanan", amount: 49000, durationDays: 30 },
  pro_3month: { label: "PRO 3 Bulan", amount: 129000, durationDays: 90 },
  pro_6month: { label: "PRO 6 Bulan", amount: 229000, durationDays: 180 },
};

export function isProPlan(plan: string): plan is ProPlan {
  return plan in PRO_PLANS;
}

export function getMidtransBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";
}

export function getMidtransApiBaseUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

export function getMidtransAuthHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) throw new Error("MIDTRANS_SERVER_KEY is not configured");
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
