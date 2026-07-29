// margaret-runtime resolves its state directory and host flags (isCodex/
// isCopilot/isQoder) once, at require time, from env vars — so each scenario
// below runs in its own child process instead of re-requiring the module
// in-process, where the first require would win for the whole test file.

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");

function run(script, env) {
  return execFileSync(process.execPath, ["-e", script], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

test("setMode/readMode/clearMode round-trip under CLAUDE_CONFIG_DIR", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "margaret-claude-"));
  try {
    const out = run(
      `
      const rt = require('./hooks/margaret-runtime');
      rt.setMode('max');
      console.log('read1:' + rt.readMode());
      rt.clearMode();
      console.log('read2:' + rt.readMode());
      `,
      {
        CLAUDE_CONFIG_DIR: tmpDir,
        COPILOT_PLUGIN_DATA: "",
        PLUGIN_DATA: "",
        QODER_SESSION_ID: "",
      },
    );
    assert.match(out, /read1:max/);
    assert.match(out, /read2:null/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("writeHookOutput: native Claude SessionStart writes raw context to stdout", () => {
  const out = run(
    `require('./hooks/margaret-runtime').writeHookOutput('SessionStart', 'full', 'RULES HERE');`,
    { COPILOT_PLUGIN_DATA: "", PLUGIN_DATA: "", QODER_SESSION_ID: "" },
  );
  assert.equal(out, "RULES HERE");
});

test("writeHookOutput: native Claude SubagentStart wraps context in hookSpecificOutput JSON", () => {
  const out = run(
    `require('./hooks/margaret-runtime').writeHookOutput('SubagentStart', 'full', 'RULES HERE');`,
    { COPILOT_PLUGIN_DATA: "", PLUGIN_DATA: "", QODER_SESSION_ID: "" },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.hookSpecificOutput.hookEventName, "SubagentStart");
  assert.equal(parsed.hookSpecificOutput.additionalContext, "RULES HERE");
});

test("writeHookOutput: Codex host emits systemMessage + hookSpecificOutput", () => {
  const out = run(
    `require('./hooks/margaret-runtime').writeHookOutput('UserPromptSubmit', 'max', 'CTX');`,
    {
      PLUGIN_DATA: "/tmp/codex-plugin-data",
      COPILOT_PLUGIN_DATA: "",
      QODER_SESSION_ID: "",
    },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.systemMessage, "MARGARET:MAX");
  assert.equal(parsed.hookSpecificOutput.additionalContext, "CTX");
});

test("writeHookOutput: Copilot host only emits additionalContext on SessionStart", () => {
  const outStart = run(
    `require('./hooks/margaret-runtime').writeHookOutput('SessionStart', 'full', 'CTX');`,
    {
      COPILOT_PLUGIN_DATA: "/tmp/copilot-plugin-data",
      PLUGIN_DATA: "",
      QODER_SESSION_ID: "",
    },
  );
  assert.deepEqual(JSON.parse(outStart), { additionalContext: "CTX" });

  const outPrompt = run(
    `require('./hooks/margaret-runtime').writeHookOutput('UserPromptSubmit', 'full', 'CTX');`,
    {
      COPILOT_PLUGIN_DATA: "/tmp/copilot-plugin-data",
      PLUGIN_DATA: "",
      QODER_SESSION_ID: "",
    },
  );
  assert.deepEqual(JSON.parse(outPrompt), {});
});

test("writeHookOutput: Qoder host emits hookSpecificOutput without systemMessage", () => {
  const out = run(
    `require('./hooks/margaret-runtime').writeHookOutput('UserPromptSubmit', 'full', 'CTX');`,
    { QODER_SESSION_ID: "abc", COPILOT_PLUGIN_DATA: "", PLUGIN_DATA: "" },
  );
  const parsed = JSON.parse(out);
  assert.equal(parsed.systemMessage, undefined);
  assert.equal(parsed.hookSpecificOutput.additionalContext, "CTX");
});
