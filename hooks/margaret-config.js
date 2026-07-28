#!/usr/bin/env node
// margaret — shared configuration resolver
//
// Resolution order for default mode:
//   1. MARGARET_DEFAULT_MODE environment variable
//   2. Config file defaultMode field:
//      - $XDG_CONFIG_HOME/margaret/config.json (any platform, if set)
//      - ~/.config/margaret/config.json (macOS / Linux fallback)
//      - %APPDATA%\margaret\config.json (Windows fallback)
//   3. 'full'

const fs = require("fs");
const path = require("path");
const os = require("os");

const DEFAULT_MODE = "full";
const RUNTIME_MODES = ["off", "lean", "full", "max"];
// review is a session-only persona switch (like lean/full/max) that can never
// become the persisted default — see writeDefaultMode.
const VALID_MODES = ["off", "lean", "full", "max", "review"];

function normalizeMode(mode) {
  if (typeof mode !== "string") return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

function normalizeConfigMode(mode) {
  if (typeof mode !== "string") return null;
  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

function normalizePersistedMode(mode) {
  return normalizeMode(mode) || normalizeConfigMode(mode);
}

// "stop margaret" / "normal mode" turn margaret off, but only as a standalone
// command. Matching the phrase anywhere in the message would turn it off
// mid-task for ordinary requests like "add a normal mode toggle" — so require
// the whole message to be the command, ignoring case and trailing punctuation.
function isDeactivationCommand(text) {
  const t = String(text || "")
    .trim()
    .toLowerCase()
    .replace(/[.!?\s]+$/, "");
  return t === "stop margaret" || t === "normal mode";
}

function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, "margaret");
  }
  if (process.platform === "win32") {
    return path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "margaret",
    );
  }
  return path.join(os.homedir(), ".config", "margaret");
}

function getConfigPath() {
  return path.join(getConfigDir(), "config.json");
}

function getClaudeDir() {
  // margaret: CLAUDE_CONFIG_DIR overrides ~/.claude, matching Claude Code.
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
}

function getDefaultMode() {
  // 1. Environment variable (highest priority)
  const envMode = process.env.MARGARET_DEFAULT_MODE;
  if (envMode && RUNTIME_MODES.includes(envMode.toLowerCase())) {
    return envMode.toLowerCase();
  }

  // 2. Config file
  try {
    const configPath = getConfigPath();
    // Strip UTF-8 BOM (common on Windows-saved files) so JSON.parse doesn't choke
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, ""),
    );
    if (
      config.defaultMode &&
      RUNTIME_MODES.includes(config.defaultMode.toLowerCase())
    ) {
      return config.defaultMode.toLowerCase();
    }
  } catch (e) {
    // Config file doesn't exist or is invalid — fall through
  }

  // 3. Default
  return DEFAULT_MODE;
}

function writeDefaultMode(mode) {
  const normalized = normalizeMode(mode);
  if (!normalized) return null;

  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  let config = {};
  try {
    config = JSON.parse(
      fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, ""),
    );
    if (!config || typeof config !== "object" || Array.isArray(config))
      config = {};
  } catch (_) {}
  config.defaultMode = normalized;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  return normalized;
}

module.exports = {
  DEFAULT_MODE,
  RUNTIME_MODES,
  VALID_MODES,
  getDefaultMode,
  getConfigDir,
  getConfigPath,
  getClaudeDir,
  normalizeMode,
  normalizeConfigMode,
  normalizePersistedMode,
  isDeactivationCommand,
  writeDefaultMode,
};
