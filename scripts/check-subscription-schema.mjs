import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const admin = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Insert a probe row into subscriptions to discover columns, then roll back via delete.
// First create a throwaway user.
const { data: u } = await admin.auth.admin.createUser({
  email: `schema_${Date.now()}@ppdsmapper.test`,
  password: "TestPassword123!",
  email_confirm: true,
});
const userId = u.user.id;

// Try inserting with all expected columns for Midtrans
const probe = {
  user_id: userId,
  plan: "pro_3month",
  status: "active",
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 90 * 864e5).toISOString(),
  midtrans_order_id: "PPDS-PROBE-123",
};

const { error: subErr } = await admin.from("subscriptions").insert(probe);
console.log(
  "[subscriptions schema]:",
  subErr ? `❌ ${subErr.message}` : "✅ accepts: user_id, plan, status, started_at, expires_at, midtrans_order_id"
);

const probePay = {
  user_id: userId,
  provider: "midtrans",
  order_id: "PPDS-PROBE-123",
  amount: 99000,
  status: "pending",
  raw_payload: { test: true },
};
const { error: payErr } = await admin.from("payments").insert(probePay);
console.log(
  "[payments schema]:",
  payErr ? `❌ ${payErr.message}` : "✅ accepts: user_id, provider, order_id, amount, status, raw_payload"
);

// Cleanup
await admin.auth.admin.deleteUser(userId);
console.log("\n🧹 cleaned up");
console.log("Done.");
