#!/usr/bin/env node
// margaret — UserPromptSubmit hook to track which margaret mode is active
// Inspects user input for /margaret commands and writes mode to flag file

const {
  getDefaultMode,
  isDeactivationCommand,
  writeDefaultMode,
} = require("./margaret-config");
const {
  clearMode,
  isQoder,
  readMode,
  setMode,
  writeHookOutput,
} = require("./margaret-runtime");
const { getMargaretInstructions } = require("./margaret-instructions");

let input = "";
let done = false;

function finish() {
  if (done) return;
  done = true;
  try {
    // Strip UTF-8 BOM some shells prepend when piping (breaks JSON.parse)
    const data = JSON.parse(input.replace(/^\uFEFF/, ""));
    const prompt = (data.prompt || "").trim().toLowerCase();

    let modeSwitched = false;
    let deactivated = false;

    // /margaret-review switches the session persona to the hidden review
    // mode (same session-scoped mechanism as lean/full/max) — never a
    // persisted default, and not backed by its own skill file; see
    // margaret-instructions.js's INDEPENDENT_MODES. margaret-scan,
    // margaret-guard, margaret-design stay one-shot skills
    // with no session-wide state.
    if (/^[/@$]margaret-review(\s|$)/.test(prompt)) {
      setMode("review");
      modeSwitched = true;
      if (!isQoder) {
        writeHookOutput(
          "UserPromptSubmit",
          "review",
          "MARGARET MODE CHANGED — level: review",
        );
      } else {
        writeHookOutput(
          "UserPromptSubmit",
          "review",
          getMargaretInstructions("review"),
        );
      }
      return;
    }

    // Only the persona command (/margaret) is tracked as a persistent mode —
    // /margaret-scan, /margaret-guard, /margaret-design are
    // one-shot skills and don't need session-wide state.
    if (/^[/@$]margaret(\s|$)/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const arg = parts[1] || "";

      let mode = null;
      let isReportOnly = false;

      // `/margaret default <mode>` persists the default to config (survives
      // restarts). Plain switches stay session-scoped (sticks until session
      // end).
      if (arg === "default") {
        const dmode = parts[2];
        if (
          dmode === "off" ||
          dmode === "lean" ||
          dmode === "full" ||
          dmode === "max"
        ) {
          writeDefaultMode(dmode);
          writeHookOutput(
            "UserPromptSubmit",
            dmode,
            "MARGARET DEFAULT SET — new sessions start in " + dmode + ".",
          );
        }
        return; // don't fall through to the session-mode switch
      }
      if (arg === "lean") mode = "lean";
      else if (arg === "full") mode = "full";
      else if (arg === "max") mode = "max";
      else if (arg === "off") mode = "off";
      else if (arg === "") {
        isReportOnly = true;
        mode = readMode() || getDefaultMode();
      } else {
        mode = getDefaultMode();
      }

      if (isReportOnly) {
        writeHookOutput(
          "UserPromptSubmit",
          mode,
          "MARGARET MODE ACTIVE — level: " + mode,
        );
      } else if (mode && mode !== "off") {
        setMode(mode);
        modeSwitched = true;
        // Qoder needs the full ruleset every turn, so when a mode switch
        // happens we fold the confirmation into the ruleset output below
        // (one JSON on stdout) instead of emitting two separate writes.
        if (!isQoder) {
          writeHookOutput(
            "UserPromptSubmit",
            mode,
            "MARGARET MODE CHANGED — level: " + mode,
          );
        }
      } else if (mode === "off") {
        clearMode();
        deactivated = true;
        writeHookOutput("UserPromptSubmit", "off", "MARGARET MODE OFF");
      }
    }

    // Detect deactivation
    if (!modeSwitched && !deactivated && isDeactivationCommand(prompt)) {
      clearMode();
      deactivated = true;
      writeHookOutput("UserPromptSubmit", "off", "MARGARET MODE OFF");
    }

    // Qoder has no SessionStart event, so UserPromptSubmit does double duty:
    // activate the default mode on first prompt (if no flag exists yet), then
    // inject the ruleset on every prompt. Claude Code/Codex do this in
    // SessionStart via margaret-activate.js; Qoder can't, so we do it here.
    // Skip when deactivated — user just turned margaret off.
    if (isQoder && !deactivated) {
      let currentMode = readMode();
      if (!currentMode) {
        currentMode = getDefaultMode();
        if (currentMode !== "off") {
          try {
            setMode(currentMode);
          } catch (e) {}
        }
      }
      if (currentMode && currentMode !== "off") {
        const header = modeSwitched
          ? "MARGARET MODE CHANGED — level: " + currentMode + "\n\n"
          : "";
        writeHookOutput(
          "UserPromptSubmit",
          currentMode,
          header + getMargaretInstructions(currentMode),
        );
      }
    }
  } catch (e) {
    // Silent fail
  }
}

process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", finish);

// Never hang the session. On Windows, Claude Code runs this hook through a
// PowerShell `if {}` wrapper that can swallow the piped prompt JSON, so stdin
// 'end' never fires and the hook blocks forever, freezing the session. On
// error, or after a short fallback, process whatever arrived and exit.
// unref() keeps the timer from adding latency to the normal path, where
// 'end' fires first.
process.stdin.on("error", () => {
  finish();
  process.exit(0);
});
setTimeout(() => {
  finish();
  process.exit(0);
}, 1000).unref();
