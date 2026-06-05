import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const anon = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", url);
console.log("Anon key prefix:", anon?.slice(0, 20));

const supabase = createClient(url, anon);

// Test 1: Check if 'profiles' table exists
const { error: profilesErr } = await supabase.from("profiles").select("id").limit(1);
console.log(
  "\n[profiles table]:",
  profilesErr ? `❌ ${profilesErr.message}` : "✅ exists & reachable"
);

// Test 2: Check subscriptions table
const { error: subsErr } = await supabase.from("subscriptions").select("id").limit(1);
console.log(
  "[subscriptions table]:",
  subsErr ? `❌ ${subsErr.message}` : "✅ exists & reachable"
);

// Test 3: Auth health
const { error: authErr } = await supabase.auth.getSession();
console.log("[auth service]:", authErr ? `❌ ${authErr.message}` : "✅ reachable");

console.log("\nDone.");
