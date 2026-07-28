#!/usr/bin/env node
// margaret: SKILL.md is the runtime source of truth for the persona; the JS
// fallback in margaret-instructions.js (used if SKILL.md can't be read at
// runtime) is a hand-written paraphrase of it, so the two can silently drift
// on the next edit. Canary, not full equality: pin the load-bearing rules
// that must survive verbatim in both. A reworded rule that drops one of these
// is the reminder to update the fallback too.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (relPath) =>
  fs
    .readFileSync(path.join(root, relPath), "utf8")
    .replace(/\r\n/g, "\n")
    .trim();

function stripFrontmatter(text) {
  return text.replace(/^---\n[\s\S]*?\n---\n*/, "").trim();
}

const agents = read("AGENTS.md");
const canonical = agents
  .replace(/\n\n\(Yes, this file also applies[\s\S]*?\)$/, "")
  .trim();

// Static rule-file copies (Cursor/Windsurf/Cline have no hook system, so they
// get a plain copy of AGENTS.md instead) must byte-match the canonical body.
const copies = [
  [".cursor/rules/margaret.mdc", stripFrontmatter],
  [".windsurf/rules/margaret.md", (t) => t.trim()],
  [".clinerules/margaret.md", (t) => t.trim()],
];

let copiesFailed = false;
for (const [relPath, normalize] of copies) {
  const actual = normalize(read(relPath));
  if (actual !== canonical) {
    console.error(`${relPath} drifted from AGENTS.md`);
    copiesFailed = true;
  }
}

const INVARIANTS = [
  "this repo already", // screen filter: reuse what already exists
  "rough heuristic", // ceiling-comment example
  "trimming correctness", // robust-variant rule
  "one runnable check", // test reflex
  "input validation at trust boundaries", // safety carve-out
  "prevents data loss", // safety carve-out
  "accessibility", // safety carve-out
  "security", // safety carve-out
  "without its check is unfinished", // one-check promoted to headline
];

const sources = [
  ["skills/margaret/SKILL.md", read("skills/margaret/SKILL.md")],
  ["hooks/margaret-instructions.js", read("hooks/margaret-instructions.js")],
  ["AGENTS.md", agents],
];

let failed = copiesFailed;
for (const phrase of INVARIANTS) {
  for (const [label, text] of sources) {
    if (!text.includes(phrase)) {
      console.error(`${label} is missing rule invariant: "${phrase}"`);
      failed = true;
    }
  }
}

if (failed) {
  console.error(
    "Update SKILL.md, AGENTS.md, the getFallbackInstructions() copy in margaret-instructions.js, or the .cursor/.windsurf/.clinerules copies so they all carry the same load-bearing rules.",
  );
  process.exit(1);
}

console.log(
  `Rule copies in sync: ${copies.length} static copies match AGENTS.md; ${INVARIANTS.length} invariants present in SKILL.md, the JS fallback, and AGENTS.md.`,
);
