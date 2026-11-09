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
  readStdin,
  setMode,
  writeHookOutput,
} = require("./margaret-runtime");
const { getMargaretInstructions } = require("./margaret-instructions");

readStdin((input) => {
  try {
    const data = JSON.parse(input.replace(/^﻿/, ""));
    const prompt = (data.prompt || "").trim().toLowerCase();

    let modeSwitched = false;
    let deactivated = false;

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

    if (/^[/@$]margaret(\s|$)/.test(prompt)) {
      const parts = prompt.split(/\s+/);
      const arg = parts[1] || "";

      let mode = null;
      let isReportOnly = false;

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
        return;
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

    if (!modeSwitched && !deactivated && isDeactivationCommand(prompt)) {
      clearMode();
      deactivated = true;
      writeHookOutput("UserPromptSubmit", "off", "MARGARET MODE OFF");
    }

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
});
