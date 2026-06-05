import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const vars = {};
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) vars[m[1]] = m[2].trim();
}

const url = vars.NEXT_PUBLIC_SUPABASE_URL;
const anon = vars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = vars.SUPABASE_SECRET_KEY;

const supabase = createClient(url, anon);
const admin = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = `ptest_${Date.now()}@ppdsmapper.test`;
const password = "TestPassword123!";

// 1. Register + auto-login
const { data: signUp, error: suErr } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name: "Persist Test" } },
});
if (suErr) {
  console.log("❌ signup:", suErr.message);
  process.exit(1);
}
const userId = signUp.user.id;
console.log("✅ user created:", userId);

// 2. Insert a quiz session (as the authenticated user — RLS applies)
const { data: session, error: sessErr } = await supabase
  .from("quiz_sessions")
  .insert({
    user_id: userId,
    specialty: "onkrad",
    mode: "adaptive",
    finished_at: new Date().toISOString(),
    total_questions: 10,
    correct_count: 7,
    overall_percent: 70,
  })
  .select()
  .single();
console.log(
  "[quiz_sessions insert]:",
  sessErr ? `❌ ${sessErr.message}` : `✅ session ${session.id}`
);

// 3. Insert responses
if (session) {
  const { error: rErr } = await supabase.from("question_responses").insert([
    {
      session_id: session.id,
      user_id: userId,
      question_id: "onkrad_sesiI_1",
      selected_answer: "c",
      correct_answer: "c",
      is_correct: true,
      topic: "Radiobiologi",
      difficulty: 0.35,
      discrimination: 1.0,
      ability_before: 0,
      ability_after: 0.3,
    },
  ]);
  console.log(
    "[question_responses insert]:",
    rErr ? `❌ ${rErr.message}` : "✅ response saved"
  );
}

// 4. Upsert topic ability
const { error: taErr } = await supabase.from("topic_abilities").upsert(
  {
    user_id: userId,
    specialty: "onkrad",
    topic: "Radiobiologi",
    theta: 0.3,
    percent: 58,
    answered_count: 4,
    correct_count: 3,
  },
  { onConflict: "user_id,specialty,topic" }
);
console.log(
  "[topic_abilities upsert]:",
  taErr ? `❌ ${taErr.message}` : "✅ ability saved"
);

// 5. RLS isolation check — can another anon read this user's sessions?
const stranger = createClient(url, anon);
const { data: leaked } = await stranger
  .from("quiz_sessions")
  .select("*")
  .eq("user_id", userId);
console.log(
  "[RLS isolation]:",
  !leaked || leaked.length === 0
    ? "✅ other clients cannot read this user's data"
    : `❌ LEAK: ${leaked.length} rows visible`
);

// Cleanup
await admin.auth.admin.deleteUser(userId);
console.log("\n🧹 cleaned up test user");
console.log("Done.");
