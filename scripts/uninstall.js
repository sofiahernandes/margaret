#!/usr/bin/env node
// margaret — removes state margaret wrote outside the plugin's own files:
// the mode flag, the config file, and the statusLine entry it added to
// settings.json. Plugin files themselves are removed by the host's own
// uninstall/marketplace-remove command; this only cleans up what that
// command can't see. Run manually: node scripts/uninstall.js

const fs = require("fs");
const path = require("path");
const {
  getConfigPath,
  getConfigDir,
  getClaudeDir,
} = require("../hooks/margaret-config");

const STATUSLINE_SCRIPT = "margaret-statusline";

function removeIfExists(filePath, label) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Removed ${label}: ${filePath}`);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

removeIfExists(path.join(getClaudeDir(), ".margaret-active"), "mode flag");
removeIfExists(getConfigPath(), "config file");
try {
  fs.rmdirSync(getConfigDir());
} catch (e) {
  // not empty or already gone — leave it
}

const settingsPath = path.join(getClaudeDir(), "settings.json");
try {
  const raw = fs.readFileSync(settingsPath, "utf8").replace(/^\uFEFF/, "");
  const settings = JSON.parse(raw);
  const cmd = settings.statusLine && settings.statusLine.command;
  // Only remove the parts margaret owns. If the user combined statuslines
  // (e.g. caveman && margaret), keep the other plugin's command intact.
  if (typeof cmd === "string" && cmd.includes(STATUSLINE_SCRIPT)) {
    const parts = cmd
      .split(/&&|;/)
      .map((s) => s.trim())
      .filter(Boolean);
    const others = parts.filter((s) => !s.includes(STATUSLINE_SCRIPT));
    if (others.length === 0) {
      delete settings.statusLine;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
      console.log(`Removed margaret statusLine entry from ${settingsPath}`);
    } else {
      settings.statusLine.command = others.join(" && ");
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
      console.log(`Removed margaret statusLine segment from ${settingsPath}`);
    }
  }
} catch (e) {
  if (e.code === "ENOENT") {
    // no settings.json — nothing to clean
  } else if (e instanceof SyntaxError) {
    // malformed settings.json — can't safely edit it; leave intact, warn
    console.warn(
      `settings.json is malformed — could not remove the margaret statusLine entry. Remove it manually from: ${settingsPath} (${e.message})`,
    );
  } else {
    throw e;
  }
}
