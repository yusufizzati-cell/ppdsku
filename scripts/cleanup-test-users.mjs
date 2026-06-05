import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

// Use secret key for admin operations (server-side only)
const admin = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await admin.auth.admin.listUsers();
if (error) {
  console.log("❌ Could not list users:", error.message);
  process.exit(1);
}

const testUsers = data.users.filter((u) => u.email?.endsWith("@ppdsmapper.test"));
console.log(`Found ${testUsers.length} test user(s) to clean up.`);

for (const u of testUsers) {
  const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
  console.log(delErr ? `❌ ${u.email}: ${delErr.message}` : `✅ deleted ${u.email}`);
}

console.log("\nDone.");
