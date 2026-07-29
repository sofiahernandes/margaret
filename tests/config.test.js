const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const config = require("../hooks/margaret-config");

test("normalizeMode accepts only known runtime modes, case-insensitive", () => {
  assert.equal(config.normalizeMode("FULL"), "full");
  assert.equal(config.normalizeMode(" max "), "max");
  assert.equal(config.normalizeMode("lean"), "lean");
  assert.equal(config.normalizeMode("off"), "off");
  assert.equal(config.normalizeMode(""), null);
  assert.equal(config.normalizeMode(undefined), null);
});

test("isDeactivationCommand requires the whole message, ignores case/punctuation", () => {
  assert.equal(config.isDeactivationCommand("stop margaret"), true);
  assert.equal(config.isDeactivationCommand("Stop Margaret!"), true);
  assert.equal(config.isDeactivationCommand("normal mode."), true);
  assert.equal(config.isDeactivationCommand("normal mode please"), false);
  assert.equal(config.isDeactivationCommand("add a normal mode toggle"), false);
  assert.equal(
    config.isDeactivationCommand("stop margaret because it broke"),
    false,
  );
});

test("getDefaultMode precedence: env var > config file > full", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "margaret-config-"));
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const prevXdg = process.env.XDG_CONFIG_HOME;
  const prevEnvMode = process.env.MARGARET_DEFAULT_MODE;
  process.env.XDG_CONFIG_HOME = tmpDir;
  delete process.env.MARGARET_DEFAULT_MODE;
  t.after(() => {
    if (prevXdg === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = prevXdg;
    if (prevEnvMode === undefined) delete process.env.MARGARET_DEFAULT_MODE;
    else process.env.MARGARET_DEFAULT_MODE = prevEnvMode;
  });

  // No env, no config file -> default 'full'
  assert.equal(config.getDefaultMode(), "full");

  // Config file set -> honored
  config.writeDefaultMode("lean");
  assert.equal(config.getDefaultMode(), "lean");

  // Env var overrides config file
  process.env.MARGARET_DEFAULT_MODE = "max";
  assert.equal(config.getDefaultMode(), "max");
});

test("writeDefaultMode rejects unknown modes", (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "margaret-config-"));
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));
  const prevXdg = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = tmpDir;
  t.after(() => {
    if (prevXdg === undefined) delete process.env.XDG_CONFIG_HOME;
    else process.env.XDG_CONFIG_HOME = prevXdg;
  });

  assert.equal(config.writeDefaultMode("bogus"), null);
  assert.equal(fs.existsSync(config.getConfigPath()), false);
});
