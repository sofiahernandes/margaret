---
allowed-tools: Bash(git:*), Bash(ls:*), Bash(cat:*), Bash(test:*), Bash(node:*), Bash(grep:*), Read, Glob, Grep, LS, Edit, Write
description: Set up margaret's project context — detect the stack, write the two context tiers, report what's missing
---

Set this repository up so every other margaret command runs without re-deriving the basics. Re-runnable: regenerate between the fences, never touch anything outside them.

REPO ROOT:

```
!`git rev-parse --show-toplevel 2>/dev/null || pwd`
```

TOP LEVEL:

```
!`ls -A | head -40`
```

PACKAGE SCRIPTS (root and common sub-apps, names only):

```
!`for f in package.json */package.json; do [ -f "$f" ] && echo "--- $f" && node -e 'const p=require("./"+process.argv[1]);console.log(Object.keys(p.scripts||{}).join(" ")||"(none)")' "$f" 2>/dev/null; done`
```

TOOLING PRESENT:

```
!`ls -d tsconfig.json */tsconfig.json eslint.config.* */eslint.config.* .eslintrc* */.eslintrc* jest.config.* */jest.config.* vitest.config.* */vitest.config.* package-lock.json yarn.lock pnpm-lock.yaml requirements.txt pyproject.toml go.mod Cargo.toml 2>/dev/null | head -20`
```

EXISTING CONVENTION FILES:

```
!`ls -d AGENTS.md CLAUDE.md .ai/*.md .github/copilot-instructions.md docs 2>/dev/null | head -10`
```

CURRENT MARGARET CONTEXT (empty on first run):

```
!`cat AGENTS.md 2>/dev/null | sed -n '/margaret:start/,/margaret:end/p'; ls -A .margaret 2>/dev/null`
```

CI WORKFLOWS:

```
!`ls .github/workflows 2>/dev/null | head -10`
```

## What to produce

Two tiers. Nothing else.

### Tier 1 — `AGENTS.md`, always loaded

A fenced block, **5 lines of body or fewer**. Create `AGENTS.md` if absent; splice the block in if present.

```markdown
<!-- margaret:start -->
## Margaret
<one-line stack: framework, CMS/runtime, package manager, directory shape>
<damage-prevention constraint>
<damage-prevention constraint>
Conventions in `.margaret/`.
<!-- margaret:end -->
```

This block is in context on **every turn of every session, forever**. Only two kinds of line earn that: the one-line stack summary, and constraints that prevent damage during ordinary work — "never edit `@futurebrand/*`, they're external packages", "no ISR, Amplify breaks". Anything a command could look up when it needs it goes in tier 2 instead.

### Tier 2 — `.margaret/`, loaded on demand

`.margaret/stack.md` — detected facts, fenced, with the freshness marker as the last line inside the fence:

```bash
node <plugin-root>/scripts/stack-hash.js --record
```

`.margaret/conventions.md` — only what detection cannot reach: where components live, how they register, naming patterns, token sources, doc format and language. Fenced the same way.

If the repo already documents its conventions (`CLAUDE.md`, `.ai/AI.md`, a `docs/` tree), **link to it, do not copy it**. A duplicated convention is a convention that will disagree with itself.

## Rules

- **Show the full diff and wait for approval before writing anything.**
- Only what detection can't reach goes in a file. If a fact is readable from `package.json`, leave it out — commands read it when they need it.
- Regenerate strictly between `<!-- margaret:start -->` and `<!-- margaret:end -->`. Prose outside the fences is the user's and survives every re-run.
- Not a Node repo? Same two tiers, different detection. Never refuse because the stack is unfamiliar.

## Readiness report

**Only if something is missing.** Silence when the repo is already set up — do not narrate a clean result.

Report, one line each, with the fix:

- No test command → what to add
- No typecheck script when a `tsconfig.json` exists → `"typecheck": "tsc --noEmit"`
- No lint command
- A CI workflow invoking a runner the repo doesn't have (a jest action with no jest installed, say)
- A capability a margaret command needs that isn't reachable here — no Figma MCP, no CMS server

Then offer to apply the fixes. This is the only command that proposes repo-config changes; `/margaret-ship` and the skills it runs report gaps but never fix them, so you are not asked twice.
