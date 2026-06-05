import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const supabase = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const testEmail = `test_${Date.now()}@ppdsmapper.test`;
const testPassword = "TestPassword123!";

console.log("Testing registration with:", testEmail);

const { data, error } = await supabase.auth.signUp({
  email: testEmail,
  password: testPassword,
  options: { data: { name: "Test User" } },
});

if (error) {
  console.log("❌ Sign up error:", error.message);
} else {
  console.log("✅ Sign up succeeded");
  console.log("   Session created:", data.session ? "YES (email confirm OFF)" : "NO (email confirm ON)");
  console.log("   User ID:", data.user?.id);

  // Check if profile was auto-created by trigger
  if (data.session) {
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    console.log(
      "   Profile auto-created:",
      profErr ? `❌ ${profErr.message}` : `✅ role=${profile.role}, name=${profile.name}`
    );
  }
}

console.log("\nDone.");
