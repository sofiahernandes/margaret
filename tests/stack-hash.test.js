const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { check, record, parseMarker, hash } = require("../scripts/stack-hash.js");

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "margaret-stack-"));
}

test("record produces a parseable marker", () => {
  const dir = tmp();
  const file = path.join(dir, "package.json");
  fs.writeFileSync(file, '{"name":"x"}');
  const parsed = parseMarker(record([file]));
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].file, file);
  assert.equal(parsed[0].recorded, hash(file));
});

test("paths containing '=' still split on the last separator", () => {
  const dir = tmp();
  const file = path.join(dir, "a=b.json");
  fs.writeFileSync(file, "{}");
  const parsed = parseMarker(record([file]));
  assert.equal(parsed[0].file, file);
  assert.equal(parsed[0].recorded, hash(file));
});

test("check reports fresh, then stale once the source changes", () => {
  const dir = tmp();
  const src = path.join(dir, "package.json");
  const stack = path.join(dir, "stack.md");
  fs.writeFileSync(src, '{"scripts":{"test":"a"}}');
  fs.writeFileSync(stack, `# stack\n\n${record([src])}\n`);

  assert.equal(check(stack).status, "fresh");

  fs.writeFileSync(src, '{"scripts":{"test":"b"}}');
  const after = check(stack);
  assert.equal(after.status, "stale");
  assert.deepEqual(after.stale, [src]);
});

test("a deleted source reads as stale, not as a crash", () => {
  const dir = tmp();
  const src = path.join(dir, "tsconfig.json");
  const stack = path.join(dir, "stack.md");
  fs.writeFileSync(src, "{}");
  fs.writeFileSync(stack, record([src]));
  fs.rmSync(src);
  assert.equal(check(stack).status, "stale");
});

test("missing or unmarked stack file is reported, not thrown", () => {
  const dir = tmp();
  assert.equal(check(path.join(dir, "nope.md")).status, "absent");
  const bare = path.join(dir, "stack.md");
  fs.writeFileSync(bare, "# stack\n\nno marker here\n");
  assert.equal(check(bare).status, "unmarked");
});
