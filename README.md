<h1 align="center">Margaret Plugin</h1>
<p align="center">
  Design the architecture first. Implement the smallest solution that satisfies it.
</p>

### Why "Margaret"

Named for [Margaret Hamilton](https://science-nasa-gov.translate.goog/people/margaret-hamilton/?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc), the lead software engineer for the Apollo Program's onboard flight software. Her team's code had to run on hardware with almost no memory or cycles to spare, survive real-time failure during a moon landing, and be provably correct because there was no patching it in flight. That's the standard this plugin borrows: engineered and reliable, no more than the mission needs.

### What it is

Margaret is a plugin for developers. It bundles four things senior engineers actually want during a session:

1. An **architect** that designs before it codes and defaults to the smallest correct implementation.
2. An **over-engineering scanner** that inspects the current diff or the whole repo.
3. A **security reviewer** that flags only high-confidence, exploitable findings in a diff.
4. A **Figma bridge** that can pull design into a starting point for code, or generate new designs or diagrams for engineers to express themselves visually.

### How it works

Before writing code, the agent runs the candidate through a set of filters and builds at the first one that clears:

```
1. Is there even a requirement here?  → no: skip it (YAGNI)
2. Does this repo already solve it?   → reuse it, don't rewrite
3. Stdlib solves it?                  → use it
4. Platform feature solves it?        → use it
5. Existing dependency solves it?     → use it
6. One line solves it?                → write the line
7. Otherwise: least code that satisfies the requirement
```

These filters only work once the problem is understood — the agent reads the code the change touches and traces the real flow before picking one.

Never trimmed away: input validation at trust boundaries, error handling that prevents data loss, security, accessibility, anything explicitly requested. A shortcut that cuts a real corner gets a `margaret:` comment naming the ceiling and the upgrade path; non-trivial logic leaves one runnable check behind.

### Commands

| Command            | Args (default)                                             | What it does                                                                                   |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/margaret`        | `lean\|full\|max\|off` (full)                              | Design first, implement smallest. Sticks until changed or session end.                         |
| `/margaret-design` | `design\|diagram\|code\|context\|connect\|motion` (design) | Figma bridge both ways: generate a new artifact, or pull an existing file/selection into code. |
| `/margaret-guard`  | —                                                          | Security review of the current diff: high-confidence, exploitable findings only.               |
| `/margaret-scan`   | `[repo]` (diff)                                            | Over-engineering scan: one line per finding, `repo` scans the whole tree instead of the diff.  |
| `/margaret-help`   | —                                                          | Reference card for all of the above.                                                           |

Set the level for every new session with `MARGARET_DEFAULT_MODE` (`lean`/`full`/`max`/`off`), or a `defaultMode` field in `~/.config/margaret/config.json` (`%APPDATA%\margaret\config.json` on Windows). Default is `full`.

### Install

Node.js needs to be on your PATH for the hook-based hosts below — if it isn't, the skills still work, the always-on activation just stays quiet instead of erroring on every prompt.

#### Claude Code

```bash
/plugin marketplace add <this-repo>
/plugin install margaret@margaret
```

(Two separate prompts.)

#### Codex

```bash
codex plugin marketplace add <this-repo>
codex plugin add margaret@margaret
```

Run `codex` and open `/hooks` to review and trust the two lifecycle hooks (reused from Claude Code's `hooks/claude-hooks.json`).

#### Gemini CLI

```bash
gemini extensions install <this-repo-url>
```

Gemini has no hook system, so it loads `AGENTS.md` as always-on context instead of switching modes — the screen always applies.

#### Cursor / Windsurf / Cline

None of these three run hooks either. Copy the matching rules file into your project:

- Cursor: [`.cursor/rules/margaret.mdc`](.cursor/rules/margaret.mdc)
- Windsurf: [`.windsurf/rules/margaret.md`](.windsurf/rules/margaret.md)
- Cline: [`.clinerules/margaret.md`](.clinerules/margaret.md)

#### GitHub Copilot / Qoder

Reference-only, not a packaged install: [`hooks/copilot-hooks.json`](hooks/copilot-hooks.json) and [`hooks/qoder-hooks.json`](hooks/qoder-hooks.json) document the hook shape those tools expect. Wire them into that tool's own settings by hand.

### Uninstall

Removing the plugin (marketplace remove / delete the checkout) doesn't touch state margaret wrote elsewhere: the mode flag, `~/.config/margaret/config.json`, and (if you wired it up) a `statusLine` entry in `~/.claude/settings.json`. **Run this before removing the plugin** — the script is itself a plugin file:

```bash
node scripts/uninstall.js
```

It only removes the statusLine segment it owns, so a statusline you combined with another plugin's is left otherwise intact.

### Development

```bash
npm test
```

Runs the unit tests, checks that every declared command/skill in `plugin.yaml` is backed by a real file, and checks that the persona's static copies (`AGENTS.md`, `.cursor/`, `.windsurf/`, `.clinerules/`) haven't drifted from each other.

### License

[MIT](LICENSE).
