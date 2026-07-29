const test = require("node:test");
const assert = require("node:assert/strict");

const {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getMargaretInstructions,
} = require("../hooks/margaret-instructions");

test("filterSkillBodyForMode keeps only the active level's table row and example", () => {
  const body = [
    "| **lean** | keep this row |",
    "| **max** | drop this row in lean mode |",
    '- lean: "keep this example"',
    '- max: "drop this example in lean mode"',
    "- No unrequested abstractions: always keep this rule",
  ].join("\n");

  const lean = filterSkillBodyForMode(body, "lean");
  assert.match(lean, /keep this row/);
  assert.doesNotMatch(lean, /drop this row/);
  assert.match(lean, /keep this example/);
  assert.doesNotMatch(lean, /drop this example/);
  assert.match(lean, /No unrequested abstractions/);

  const max = filterSkillBodyForMode(body, "max");
  assert.match(max, /drop this row in lean mode/); // it's the max-labeled row, kept for max
  assert.doesNotMatch(max, /keep this row/);
});

test("filterSkillBodyForMode strips frontmatter", () => {
  const body = "---\nname: x\n---\nBody text.";
  const out = filterSkillBodyForMode(body, "full");
  assert.doesNotMatch(out, /name: x/);
  assert.match(out, /Body text\./);
});

test("getFallbackInstructions embeds the requested level and core sections", () => {
  const out = getFallbackInstructions("max");
  assert.match(out, /MARGARET MODE ACTIVE — level: max/);
  assert.match(out, /## The screen/);
  assert.match(out, /## Where this stops applying/);
});

test("getMargaretInstructions reads the real SKILL.md and headers it with the level", () => {
  const out = getMargaretInstructions("full");
  assert.match(out, /^MARGARET MODE ACTIVE — level: full/);
  assert.match(out, /# Margaret/);
  assert.match(out, /The screen/);
});

test("getMargaretInstructions normalizes an unknown mode to full", () => {
  const out = getMargaretInstructions("not-a-real-mode");
  assert.match(out, /level: full/);
});
