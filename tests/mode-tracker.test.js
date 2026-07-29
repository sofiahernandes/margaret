const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const hookPath = path.join(root, "hooks", "margaret-mode-tracker.js");

function runHook(prompt, claudeDir) {
  return execFileSync(process.execPath, [hookPath], {
    input: JSON.stringify({ prompt }),
    env: {
      ...process.env,
      CLAUDE_CONFIG_DIR: claudeDir,
      COPILOT_PLUGIN_DATA: "",
      PLUGIN_DATA: "",
      QODER_SESSION_ID: "",
    },
    encoding: "utf8",
  });
}

function withTmpDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "margaret-tracker-"));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("/margaret max switches mode and persists the flag file", () => {
  withTmpDir((dir) => {
    const out = runHook("/margaret max", dir);
    assert.equal(out, "MARGARET MODE CHANGED — level: max");
    assert.equal(
      fs.readFileSync(path.join(dir, ".margaret-active"), "utf8"),
      "max",
    );
  });
});

test("/margaret with no args reports the current mode without changing it", () => {
  withTmpDir((dir) => {
    fs.writeFileSync(path.join(dir, ".margaret-active"), "lean");
    const out = runHook("/margaret", dir);
    assert.equal(out, "MARGARET MODE ACTIVE — level: lean");
    assert.equal(
      fs.readFileSync(path.join(dir, ".margaret-active"), "utf8"),
      "lean",
    );
  });
});

test("/margaret off clears the flag file", () => {
  withTmpDir((dir) => {
    fs.writeFileSync(path.join(dir, ".margaret-active"), "full");
    const out = runHook("/margaret off", dir);
    assert.equal(out, "MARGARET MODE OFF");
    assert.equal(fs.existsSync(path.join(dir, ".margaret-active")), false);
  });
});

test('"stop margaret" deactivates same as /margaret off', () => {
  withTmpDir((dir) => {
    fs.writeFileSync(path.join(dir, ".margaret-active"), "full");
    const out = runHook("stop margaret", dir);
    assert.equal(out, "MARGARET MODE OFF");
    assert.equal(fs.existsSync(path.join(dir, ".margaret-active")), false);
  });
});

test("an unrelated prompt does not touch the flag file or emit output", () => {
  withTmpDir((dir) => {
    const out = runHook("please add a normal mode toggle to settings", dir);
    assert.equal(out, "");
    assert.equal(fs.existsSync(path.join(dir, ".margaret-active")), false);
  });
});

test("/margaret-scan does not get tracked as a persistent mode", () => {
  withTmpDir((dir) => {
    const out = runHook("/margaret-scan repo", dir);
    assert.equal(out, "");
    assert.equal(fs.existsSync(path.join(dir, ".margaret-active")), false);
  });
});
