#!/usr/bin/env node
// margaret — Claude Code SessionStart activation hook
//
// Runs on every session start: writes flag file at
// $CLAUDE_CONFIG_DIR/.margaret-active (defaults to ~/.claude) and emits the
// margaret ruleset as hidden SessionStart context.

const { getDefaultMode } = require("./margaret-config");
const { getMargaretInstructions } = require("./margaret-instructions");
const {
  clearMode,
  isCodex,
  isCopilot,
  setMode,
  writeHookOutput,
} = require("./margaret-runtime");

const mode = getDefaultMode();

// "off" mode — skip activation entirely, don't write flag or emit rules
if (mode === "off") {
  clearMode();
  const hookOutput = isCodex || isCopilot ? "" : "OK";
  writeHookOutput("SessionStart", "off", hookOutput);
  process.exit(0);
}

try {
  setMode(mode);
} catch (e) {
  // Silent fail -- flag is best-effort, don't block the hook
}

try {
  writeHookOutput("SessionStart", mode, getMargaretInstructions(mode));
} catch (e) {
  // Silent fail — stdout closed/EPIPE at hook exit must not surface as a hook failure
}
