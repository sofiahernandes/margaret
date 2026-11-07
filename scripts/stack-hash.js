#!/usr/bin/env node
// margaret: keeps `.margaret/stack.md` honest without re-reading source files into
// an agent's context. init records a short hash per source it derived facts from;
// this compares them and prints one line. ~20 tokens instead of ~1.5k.
//
//   node scripts/stack-hash.js            → check, prints "fresh" or "stale: <files>"
//   node scripts/stack-hash.js --record   → print the marker line for the files given
//                                           (or the detected defaults)

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const MARKER = /<!--\s*margaret:sources\s+([^>]*?)\s*-->/;
const STACK = path.join(".margaret", "stack.md");

function hash(file) {
  try {
    return crypto
      .createHash("sha256")
      .update(fs.readFileSync(file))
      .digest("hex")
      .slice(0, 8);
  } catch {
    return null; // missing file — treated as stale so init re-derives
  }
}

function parseMarker(text) {
  const m = text.match(MARKER);
  if (!m) return null;
  return m[1]
    .split(/\s+/)
    .filter(Boolean)
    .map((pair) => {
      const i = pair.lastIndexOf("=");
      return { file: pair.slice(0, i), recorded: pair.slice(i + 1) };
    });
}

function record(files) {
  const parts = files.map((f) => `${f}=${hash(f) ?? "missing"}`);
  return `<!-- margaret:sources ${parts.join(" ")} -->`;
}

function check(stackPath = STACK) {
  let text;
  try {
    text = fs.readFileSync(stackPath, "utf8");
  } catch {
    return { status: "absent", stale: [] };
  }
  const sources = parseMarker(text);
  if (!sources) return { status: "unmarked", stale: [] };
  const stale = sources
    .filter(({ file, recorded }) => hash(file) !== recorded)
    .map(({ file }) => file);
  return { status: stale.length ? "stale" : "fresh", stale };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === "--record") {
    const files = args.slice(1).length
      ? args.slice(1)
      : [
          "package.json",
          "tsconfig.json",
          "frontend/package.json",
          "backend/package.json",
        ].filter((f) => fs.existsSync(f));
    console.log(record(files));
  } else {
    const { status, stale } = check();
    console.log(status === "stale" ? `stale: ${stale.join(" ")}` : status);
  }
}

module.exports = { check, record, parseMarker, hash };
