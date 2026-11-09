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

// margaret-instructions.js builds its strings by concatenation, so an
// invariant can straddle a `" +` seam and read as missing when it isn't.
// Collapse the seams before matching.
const dejoin = (text) => text.replace(/"\s*\+\s*\r?\n\s*"/g, "");

const instructions = dejoin(read("hooks/margaret-instructions.js"));

const sources = [
  ["skills/margaret/SKILL.md", read("skills/margaret/SKILL.md")],
  ["hooks/margaret-instructions.js", instructions],
  ["AGENTS.md", agents],
];

// The scan standard has its own JS copy: REVIEW_INSTRUCTIONS, injected by the
// hook when review mode is on. The command prompts delegate to the skill, but
// a runtime-injected string can't, so this is the one copy that stays — pinned
// here instead. The tag vocabulary already drifted once (the command prompt
// shipped delete/stdlib/native/yagni/shrink against the skill's five) and
// nothing caught it.
const SCAN_INVARIANTS = [
  "`cut:`",
  "`builtin:`",
  "`platform:`",
  "`overbuilt:`",
  "`condense:`",
  "net: -",
  "Already lean. Ship it.",
];

const scanSources = [
  ["skills/margaret-scan/SKILL.md", read("skills/margaret-scan/SKILL.md")],
  ["hooks/margaret-instructions.js", instructions],
];

let failed = copiesFailed;

function pin(phrases, where, label) {
  for (const phrase of phrases) {
    for (const [name, text] of where) {
      if (!text.includes(phrase)) {
        console.error(`${name} is missing ${label}: "${phrase}"`);
        failed = true;
      }
    }
  }
}

pin(INVARIANTS, sources, "rule invariant");
pin(SCAN_INVARIANTS, scanSources, "scan invariant");

if (failed) {
  console.error(
    "Update SKILL.md, AGENTS.md, the getFallbackInstructions()/REVIEW_INSTRUCTIONS copies in margaret-instructions.js, or the .cursor/.windsurf/.clinerules copies so they all carry the same load-bearing rules.",
  );
  process.exit(1);
}

console.log(
  `Rule copies in sync: ${copies.length} static copies match AGENTS.md; ${INVARIANTS.length} rule invariants present in SKILL.md, the JS fallback, and AGENTS.md; ${SCAN_INVARIANTS.length} scan invariants present in margaret-scan's SKILL.md and REVIEW_INSTRUCTIONS.`,
);
