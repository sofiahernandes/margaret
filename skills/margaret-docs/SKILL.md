---
name: margaret-docs
description: >
  Bring the repo's documentation back in line with a change that just
  landed — changelog, README, in-repo docs, agent context files. Decides
  what the change actually warrants instead of touching everything. Writes
  internal append-only files directly; proposes a diff for anything
  published or rewritten in place. Use when the user says "update the
  docs", "document this", "add a changelog entry", "is the README still
  right", or as the final step of /margaret-ship. Do NOT trigger on a
  request to write new standalone documentation from scratch, or on an
  ordinary code change with no documentation question attached.
---

Keep the docs true to the code that just changed. Nothing more.

Documentation drifts in one direction: code moves, prose doesn't. This skill closes that gap for **one specific change** — never a general documentation pass.

## Scope the change first

Read the diff (same scope as `/margaret-guard`: `git diff --merge-base origin/HEAD`), then ask what it actually invalidated. Most changes invalidate nothing.

| Change | Usually warrants |
|---|---|
| Internal fix, no visible behavior change | changelog entry, nothing else |
| New or changed public API, CLI flag, env var | changelog + the doc that documents that surface |
| New dependency, script, or build step | changelog + setup docs + `.margaret/stack.md` |
| Moved or renamed files | every doc that names the old path |
| New convention or pattern | `.margaret/conventions.md`, and the agent context file if it changes how work gets done |

**A one-line bugfix earns a one-line changelog entry and nothing else.** Touching five files for it is the failure mode, not thoroughness.

## Where to look

In order, stopping once you've found what this change touches:

1. The changelog — `HISTORY.md`, `CHANGELOG.md`, or whatever the repo uses
2. `.margaret/stack.md` — stale if the change touched `package.json`, lockfiles, or tooling. Check with `node <plugin-root>/scripts/stack-hash.js`, which costs a line of output instead of a file read
3. `.margaret/conventions.md` — only if the change established or broke a pattern
4. `AGENTS.md` / `CLAUDE.md` — only if it changes how an agent should work here. The `margaret:` fence is machine-owned; prose outside it is the user's
5. `README.md` — setup, commands, architecture claims the change contradicts
6. In-repo docs — `docs/`, `.ai/`, a docs site

Follow whatever format and language each file already uses. A pt-BR changelog stays pt-BR.

## Write or propose

Split by blast radius, not by file type:

**Write directly** — internal, append-only, cheap to revert:

- `.margaret/*` (between the fences only)
- The changelog — a new entry at the top, existing entries untouched

**Propose a diff and wait** — rewritten in place, or visible to someone who isn't you:

- `README.md`
- Anything under a docs tree, especially `.mdx` or anything a site builds from. **A structured docs directory is often a published site, so writing there is publishing, not documenting.** Check for a site config (`docs.json`, `mint.json`, `mkdocs.yml`, `docusaurus.config.*`) before assuming otherwise
- `AGENTS.md` / `CLAUDE.md`
- Inline comments and docstrings

## Inline comments

Leave them alone unless the change made one **wrong**. A stale comment that now lies is a bug — fix it. A function that gained a parameter its docstring doesn't list is worth updating.

Do not add commentary to code that reads fine. Both the margaret persona and the review bar treat a comment restating its own code as something to cut, and this skill will not go around manufacturing them.

## Writing the entry

Say what changed and why someone would care. Not a diff summary.

❌ `Updated slug.ts, added a regex, modified two tests.`

✅ `Slugs no longer collapse double hyphens — "a--b" stayed "a--b" and broke the posts route.`

## Out of scope

Doesn't write new standalone documentation, doesn't restructure docs, doesn't fix the code it's documenting, doesn't run checks (`/margaret-preflight`), doesn't review (`/margaret-scan`, `/margaret-guard`).

Nothing drifted? `Docs are current.` and stop. An invented entry is worse than no entry.
