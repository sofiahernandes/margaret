---
allowed-tools: Bash(git:*), Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(yarn:*), Bash(pnpm:*), Read, Glob, Grep, LS, Edit, Write, Skill, Task
description: Run the per-change loop on this branch — checks, over-engineering scan, security pass, docs
---

Take the change on this branch from "it works on my machine" to "it's ready". Four steps, in order, stopping at the first failure.

BRANCH:

```
!`git rev-parse --abbrev-ref HEAD 2>/dev/null`
```

STATUS:

```
!`git status --short`
```

FILES CHANGED:

```
!`git diff --name-only origin/HEAD... 2>/dev/null || git diff --name-only HEAD`
```

## The sequence

1. **`margaret-preflight`** — the repo's own checks: typecheck, lint, tests.
2. **`margaret-scan`** — over-engineering in the diff. Pass along any dead-code or duplication evidence preflight gathered.
3. **`margaret-guard`** — exploitable security findings in the diff.
4. **`margaret-docs`** — bring changelog, context files, and docs back in line.

Each step reads the same change set (`git diff --merge-base origin/HEAD`) and runs independently. Step 3 does not depend on step 2's conclusions.

## Fail fast, then carry on

Stop at the first step that fails. Don't run the rest — findings about code that's about to change are findings you pay for twice.

Then:

1. Report what failed, shortest form that identifies the cause.
2. Offer the fix. Where the fix is a judgment call, lay out the options and **ask** — don't pick for the user.
3. Once it's fixed, **re-run the step that failed**, then continue from there. Don't restart the sequence.

A step that reports findings without failing — a scan listing three cuts, a guard pass with a low-confidence note — is not a failure. Surface it and keep going.

## Interactive by design

This command expects a person. It stops to ask, and that is the point.

Don't wire it to a git hook or a CI job. **CI should run the deterministic half directly** — `npm run typecheck`, `npm run lint`, `npm test` — which costs no tokens and needs no agent. Steps 2 through 4 need judgment and a person to answer; they belong here, before the push.

## Scope

Branch against its upstream default, including uncommitted work. No upstream? Fall back to `git diff HEAD` and say so.

Nothing to do at a step — checks green, nothing to cut, nothing unsafe, docs current — say so in one line and move on. Four clean steps end with a one-line verdict, not a report.
