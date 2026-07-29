const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
const scriptPath = path.join(root, "scripts", "uninstall.js");

function withTmp(fn) {
  const claudeDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "margaret-un-claude-"),
  );
  const configHome = fs.mkdtempSync(
    path.join(os.tmpdir(), "margaret-un-config-"),
  );
  try {
    return fn(claudeDir, configHome);
  } finally {
    fs.rmSync(claudeDir, { recursive: true, force: true });
    fs.rmSync(configHome, { recursive: true, force: true });
  }
}

function run(claudeDir, configHome) {
  return execFileSync(process.execPath, [scriptPath], {
    env: {
      ...process.env,
      CLAUDE_CONFIG_DIR: claudeDir,
      XDG_CONFIG_HOME: configHome,
    },
    encoding: "utf8",
  });
}

test("removes the mode flag and config file", () => {
  withTmp((claudeDir, configHome) => {
    fs.writeFileSync(path.join(claudeDir, ".margaret-active"), "max");
    fs.mkdirSync(path.join(configHome, "margaret"), { recursive: true });
    fs.writeFileSync(
      path.join(configHome, "margaret", "config.json"),
      '{"defaultMode":"max"}',
    );

    run(claudeDir, configHome);

    assert.equal(
      fs.existsSync(path.join(claudeDir, ".margaret-active")),
      false,
    );
    assert.equal(
      fs.existsSync(path.join(configHome, "margaret", "config.json")),
      false,
    );
  });
});

test("strips only the margaret segment from a combined statusLine", () => {
  withTmp((claudeDir, configHome) => {
    fs.writeFileSync(
      path.join(claudeDir, "settings.json"),
      JSON.stringify({
        statusLine: {
          type: "command",
          command: "bash margaret-statusline.sh && bash other.sh",
        },
      }),
    );

    run(claudeDir, configHome);

    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"),
    );
    assert.equal(settings.statusLine.command, "bash other.sh");
  });
});

test("removes statusLine entirely when margaret is the only segment", () => {
  withTmp((claudeDir, configHome) => {
    fs.writeFileSync(
      path.join(claudeDir, "settings.json"),
      JSON.stringify({
        statusLine: { type: "command", command: "bash margaret-statusline.sh" },
      }),
    );

    run(claudeDir, configHome);

    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"),
    );
    assert.equal(settings.statusLine, undefined);
  });
});

test("leaves an unrelated statusLine command untouched", () => {
  withTmp((claudeDir, configHome) => {
    fs.writeFileSync(
      path.join(claudeDir, "settings.json"),
      JSON.stringify({
        statusLine: { type: "command", command: "bash caveman-statusline.sh" },
      }),
    );

    run(claudeDir, configHome);

    const settings = JSON.parse(
      fs.readFileSync(path.join(claudeDir, "settings.json"), "utf8"),
    );
    assert.equal(settings.statusLine.command, "bash caveman-statusline.sh");
  });
});

test("is a no-op (no throw) when nothing is installed", () => {
  withTmp((claudeDir, configHome) => {
    assert.doesNotThrow(() => run(claudeDir, configHome));
  });
});
