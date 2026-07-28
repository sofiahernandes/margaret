---
name: margaret-help
description: >
  Quick-reference card for all margaret commands, modes, and flags. One-shot
  display, not a persistent mode. Trigger: /margaret-help, "margaret help",
  "what margaret commands", "how do I use margaret".
---

# Margaret Help

Show this card on invocation. It's a one-shot display — don't switch modes, write state files, or persist anything as a side effect.

## Supported hosts

Full command/skill/hook support: **Claude Code** (`.claude-plugin/`), **Codex** (`.codex-plugin/`, shares `hooks/claude-hooks.json`). Context-file only, no hook system or mode switching: **Gemini CLI** (`gemini-extension.json` → `AGENTS.md`), **Cursor** (`.cursor/rules/margaret.mdc`), **Windsurf** (`.windsurf/rules/margaret.md`), **Cline** (`.clinerules/margaret.md`) — on these three the screen applies unconditionally, since there's no hook layer to drive `/margaret lean|full|max`. `Copilot`/`Qoder` ship reference hook manifests only (`hooks/copilot-hooks.json`, `hooks/qoder-hooks.json`) for manual wiring into that tool's own settings — no packaged install for either.

## Commands

| Command            | Args (default)                                             | What it does                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/margaret`        | `lean\|full\|max\|off` (full)                              | Senior-engineer persona: requirement check → reuse → stdlib → platform → dependency → one line → minimal build. Holds until changed or session end.                                                                                                                                          |
| `/margaret-scan`   | `[repo]` (diff)                                            | One-shot over-engineering scan: `L42: overbuilt: factory, one product. Inline.` `repo` widens the scan to the whole tree instead of just the diff.                                                                                                                                           |
| `/margaret-review` | —                                                          | Switches the session persona to review mode: same complexity-hunt framing as `/margaret-scan`, but holds across turns and propagates into subagents like `/margaret lean\|full\|max` — not a one-shot pass. Hidden mode, not its own skill; revert with `/margaret full` or "stop margaret". |
| `/margaret-guard`  | —                                                          | Security pass on the current diff: exploitable findings only, false positives filtered out.                                                                                                                                                                                                  |
| `/margaret-design` | `design\|diagram\|code\|context\|connect\|motion` (design) | Figma bridge both ways: generate a new artifact or pull an existing file/selection into code.                                                                                                                                                                                                |
| `/margaret-help`   | —                                                          | This card.                                                                                                                                                                                                                                                                                   |

## Levels (`/margaret`)

| Level    | What changes                                                                               |
| -------- | ------------------------------------------------------------------------------------------ |
| **lean** | Build what was asked, mention the smaller alternative in one line.                         |
| **full** | The full screen applies. Default.                                                          |
| **max**  | Requirement gets questioned before any code — cut first, add only what's proven necessary. |

## Turning it off

Say "stop margaret" or "normal mode". Bring it back anytime with `/margaret`. `/margaret off` works too.

## Setting the default level

Out of the box it's `full`, active from the start of every session.

**Environment variable** (checked first):

```bash
export MARGARET_DEFAULT_MODE=max
```

**Config file** (`~/.config/margaret/config.json`, on Windows:
`%APPDATA%\margaret\config.json`):

```json
{ "defaultMode": "lean" }
```

Use `"off"` to skip auto-activation and start `/margaret` by hand when wanted. Priority order: env var, then config file, then `full`.

## Status line

Displays the current level (`[MARGARET]`, `[MARGARET:MAX]`). Not wired in automatically — add this to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"<plugin-root>/hooks/margaret-statusline.sh\""
  }
}
```

(swap in the `.ps1` script on Windows).

## Removing it

Uninstalling the plugin (marketplace removal, or deleting the checkout) leaves behind whatever margaret wrote elsewhere on disk: the active-mode flag, the config file, the status-line entry. Run `node scripts/uninstall.js` from the plugin root beforehand to clear those out.
