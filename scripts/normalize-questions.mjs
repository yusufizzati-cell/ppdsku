import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(
  readFileSync(new URL("../onkrad.json", import.meta.url), "utf8")
);

const normalized = raw.map((q) => ({
  id: q.id,
  stem: q.stem,
  options: q.options,
  answer: q.answer ?? null,
  topic: q.topic,
  subtopic: q.subtopic ?? undefined,
  difficulty: typeof q.difficulty === "number" ? q.difficulty : 0,
  discrimination: typeof q.discrimination === "number" ? q.discrimination : 1.0,
  source_session: q.session ?? q.source_session ?? undefined,
  cognitive_level: q.cognitive_level ?? undefined,
  explanation: q.explanation ?? undefined,
}));

writeFileSync(
  new URL("../public/data/onkrad.json", import.meta.url),
  JSON.stringify(normalized)
);

const scoreable = normalized.filter((q) => q.answer !== null && q.answer !== "");
console.log(`✅ Wrote ${normalized.length} questions to public/data/onkrad.json`);
console.log(`   Scoreable (with answer key): ${scoreable.length}`);
console.log(`   Practice-only (no answer key): ${normalized.length - scoreable.length}`);
