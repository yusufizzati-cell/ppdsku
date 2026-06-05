import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const secret = vars.SUPABASE_SECRET_KEY;
const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Replicate the isPro logic from lib/subscription.ts
function computeIsPro(sub) {
  if (!sub || sub.status !== "active") return false;
  return Boolean(sub.expires_at && new Date(sub.expires_at).getTime() > Date.now());
}

async function makeUser() {
  const { data } = await admin.auth.admin.createUser({
    email: `gating_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@ppdsmapper.test`,
    password: "TestPassword123!",
    email_confirm: true,
  });
  return data.user.id;
}

async function getActiveSub(userId) {
  const { data } = await admin
    .from("subscriptions")
    .select("plan, status, expires_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

let pass = 0;
let fail = 0;
const check = (label, cond) => {
  console.log(cond ? `✅ ${label}` : `❌ ${label}`);
  cond ? pass++ : fail++;
};

// CASE 1: Free user (no subscription) → not PRO
const freeUser = await makeUser();
check("Free user (no sub) → isPro=false", computeIsPro(await getActiveSub(freeUser)) === false);

// CASE 2: Active PRO with future expiry → PRO
const proUser = await makeUser();
await admin.from("subscriptions").insert({
  user_id: proUser,
  plan: "pro_3month",
  status: "active",
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 90 * 864e5).toISOString(),
  midtrans_order_id: "PPDS-ACTIVE-1",
});
check("Active sub, future expiry → isPro=true", computeIsPro(await getActiveSub(proUser)) === true);

// CASE 3: Expired subscription (status active but past expiry) → NOT PRO
const expiredUser = await makeUser();
await admin.from("subscriptions").insert({
  user_id: expiredUser,
  plan: "pro_monthly",
  status: "active",
  started_at: new Date(Date.now() - 60 * 864e5).toISOString(),
  expires_at: new Date(Date.now() - 1 * 864e5).toISOString(), // expired yesterday
  midtrans_order_id: "PPDS-EXPIRED-1",
});
check("Active status but expired date → isPro=false", computeIsPro(await getActiveSub(expiredUser)) === false);

// CASE 4: Pending subscription (not active) → NOT PRO
const pendingUser = await makeUser();
await admin.from("subscriptions").insert({
  user_id: pendingUser,
  plan: "pro_3month",
  status: "pending",
  started_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 90 * 864e5).toISOString(),
  midtrans_order_id: "PPDS-PENDING-1",
});
check("Pending status → isPro=false", computeIsPro(await getActiveSub(pendingUser)) === false);

// Cleanup
for (const id of [freeUser, proUser, expiredUser, pendingUser]) {
  await admin.auth.admin.deleteUser(id);
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log("🧹 cleaned up test users");
process.exit(fail > 0 ? 1 : 0);
