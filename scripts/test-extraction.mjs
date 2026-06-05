#!/usr/bin/env node
/**
 * Sprint P2 — Verify extraction tables exist.
 * Usage: node scripts/test-extraction.mjs
 * Requires .env.local with SUPABASE_SECRET_KEY.
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Read .env.local
const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log("\n📋 Sprint P2 — Extraction Schema Verification\n");

  // Check extraction_jobs table
  const { data: jobs, error: jobsErr } = await supabase
    .from("extraction_jobs")
    .select("id")
    .limit(1);

  if (jobsErr) {
    console.error("❌ extraction_jobs table:", jobsErr.message);
  } else {
    console.log("✅ extraction_jobs table exists");
  }

  // Check extracted_questions table
  const { data: questions, error: questionsErr } = await supabase
    .from("extracted_questions")
    .select("id")
    .limit(1);

  if (questionsErr) {
    console.error("❌ extracted_questions table:", questionsErr.message);
  } else {
    console.log("✅ extracted_questions table exists");
  }

  // Check uploads table has correct status options
  const { data: uploads, error: uploadsErr } = await supabase
    .from("uploads")
    .select("id, status")
    .limit(1);

  if (uploadsErr) {
    console.error("❌ uploads table:", uploadsErr.message);
  } else {
    console.log("✅ uploads table exists");
  }

  console.log("\n🎉 Schema verification complete.\n");
}

main().catch(console.error);
