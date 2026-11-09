#!/usr/bin/env node
// margaret — Claude Code SubagentStart hook
//
// SessionStart context is parent-thread only and never reaches subagents, so
// without this every Task-spawned agent runs margaret-unaware. When margaret
// mode is active, inject the same ruleset into each subagent.
//
// Scoping (opt-in): set MARGARET_SUBAGENT_MATCHER to a regex and the ruleset
// is injected only into subagents whose agent_type matches. The regex is
// unanchored and case-insensitive — "explore|general" matches either,
// "^general$" is exact. Unset means inject into every subagent, as before.

const { getMargaretInstructions } = require("./margaret-instructions");
const { readMode, readStdin, writeHookOutput } = require("./margaret-runtime");

const mode = readMode();

if (!mode || mode === "off") {
  process.exit(0);
}

function inject() {
  try {
    writeHookOutput("SubagentStart", mode, getMargaretInstructions(mode));
  } catch (e) {
    // Silent fail — a stdout error at hook exit must not surface as a hook failure.
  }
}

let matcherRe = null;
try {
  if (process.env.MARGARET_SUBAGENT_MATCHER) {
    matcherRe = new RegExp(process.env.MARGARET_SUBAGENT_MATCHER, "i");
  }
} catch (e) {
  matcherRe = null;
}

if (!matcherRe) {
  inject();
  process.exit(0);
}

readStdin((input) => {
  let agentType = "";
  try {
    agentType = String(
      JSON.parse(input.replace(/^﻿/, "")).agent_type || "",
    ).trim();
  } catch (e) {
    // Unparseable payload — fall through and inject to be safe.
  }
  if (agentType && !matcherRe.test(agentType)) {
    process.exit(0);
  }
  inject();
});
