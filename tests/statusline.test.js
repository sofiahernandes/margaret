const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const scriptPath = path.join(root, "hooks", "margaret-statusline.sh");

function runStatusline(dir) {
  return execFileSync("bash", [scriptPath], {
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    encoding: "utf8",
  });
}

function withFlag(mode, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "margaret-status-"));
  try {
    if (mode !== null)
      fs.writeFileSync(path.join(dir, ".margaret-active"), mode);
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("no flag file -> empty output, exit 0", () => {
  withFlag(null, (dir) => {
    const out = runStatusline(dir);
    assert.equal(out, "");
  });
});

test("full mode -> [MARGARET] in green (108)", () => {
  withFlag("full", (dir) => {
    const out = runStatusline(dir);
    assert.match(out, /\[MARGARET\]/);
    assert.match(out, /38;5;108/);
  });
});

test("max mode -> [MARGARET:MAX] in amber (173)", () => {
  withFlag("max", (dir) => {
    const out = runStatusline(dir);
    assert.match(out, /\[MARGARET:MAX\]/);
    assert.match(out, /38;5;173/);
  });
});

test("lean mode -> [MARGARET:LEAN] in green (108)", () => {
  withFlag("lean", (dir) => {
    const out = runStatusline(dir);
    assert.match(out, /\[MARGARET:LEAN\]/);
    assert.match(out, /38;5;108/);
  });
});
