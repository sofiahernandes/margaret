const fs = require("fs");
const path = require("path");
const os = require("os");
const { getClaudeDir } = require("./margaret-config");

const STATE_FILE = ".margaret-active";
const isCopilot = Boolean(process.env.COPILOT_PLUGIN_DATA);
const isCodex = !isCopilot && Boolean(process.env.PLUGIN_DATA);
const isQoder = !isCopilot && !isCodex && Boolean(process.env.QODER_SESSION_ID);

let stateDir = getClaudeDir();
if (isCodex) stateDir = process.env.PLUGIN_DATA;
if (isCopilot) stateDir = process.env.COPILOT_PLUGIN_DATA;
if (isQoder) stateDir = path.join(os.homedir(), ".qoder");

const statePath = path.join(stateDir, STATE_FILE);

function setMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

function clearMode() {
  try {
    fs.unlinkSync(statePath);
  } catch (e) {}
}

// Live mode written by activate/mode-tracker. Absent flag = margaret off.
function readMode() {
  try {
    return fs.readFileSync(statePath, "utf8").trim() || null;
  } catch (e) {
    return null;
  }
}

function writeHookOutput(event, mode, context = "") {
  if (isCopilot) {
    process.stdout.write(
      JSON.stringify(
        event === "SessionStart" && context
          ? { additionalContext: context }
          : {},
      ),
    );
    return;
  }
  const needsJson = isCodex || isQoder || event === "SubagentStart";
  if (needsJson) {
    const output = {};
    if (isCodex) output.systemMessage = `MARGARET:${mode.toUpperCase()}`;
    if (context) {
      output.hookSpecificOutput = {
        hookEventName: event,
        additionalContext: context,
      };
    }
    process.stdout.write(JSON.stringify(output));
    return;
  }
  process.stdout.write(context);
}

function readStdin(callback, timeoutMs = 1000) {
  let input = "";
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    callback(input);
  }
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });
  process.stdin.on("end", finish);
  process.stdin.on("error", () => {
    finish();
    process.exit(0);
  });
  setTimeout(() => {
    finish();
    process.exit(0);
  }, timeoutMs).unref();
}

module.exports = {
  clearMode,
  isCodex,
  isCopilot,
  isQoder,
  readMode,
  readStdin,
  setMode,
  writeHookOutput,
};
