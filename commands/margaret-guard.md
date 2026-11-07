---
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git show:*), Bash(git remote show:*), Bash(cat .margaret/*), Read, Glob, Grep, LS, Skill, Task
description: Security review of the pending changes on the current branch
---

You are a senior security engineer reviewing the changes on this branch.

GIT STATUS:

```
!`git status`
```

CUSTOM SCAN INSTRUCTIONS (optional, from `.margaret/security-instructions.md` — additional
categories or repo-specific context, added to the skill's; empty if the file doesn't exist):

```
!`cat .margaret/security-instructions.md 2>/dev/null`
```

EXCLUDED PATHS (optional, from `.margaret/security-exclude` — one glob per line, e.g.
`vendor/**` or `**/*_generated.go`; empty if the file doesn't exist):

```
!`cat .margaret/security-exclude 2>/dev/null`
```

FILES MODIFIED:

```
!`git diff --name-only origin/HEAD...`
```

COMMITS:

```
!`git log --no-decorate origin/HEAD...`
```

DIFF CONTENT:

```
!`git diff --merge-base origin/HEAD`
```

OBJECTIVE:
Find HIGH-CONFIDENCE security vulnerabilities newly introduced by this diff, with real exploitation potential. Not a general code review — security implications of what changed, only. Do not comment on pre-existing issues outside the diff.

THE STANDARD:
Load the `margaret-guard` skill and apply it as written. It is the single source for what counts as a finding — categories, the >80% confidence bar and its scale, the never-report list, the precedents, the method, and the report format. Don't restate it here and don't substitute your own judgment for it.

Fold in the two optional sections gathered above when they are non-empty: CUSTOM SCAN INSTRUCTIONS adds categories and context (never replaces the skill's), and EXCLUDED PATHS drops any finding whose file matches.

PROCESS:
What this command adds on top of the skill is the fan-out — the skill alone is a single read-through.

1. Sub-task: identify candidate vulnerabilities using the skill's three-step method.
2. For each candidate, a parallel sub-task filters false positives against the skill's never-report list, precedents, and confidence scale, returning a 1-10 score.
3. Keep only findings scored 8 or above.

Final reply: the markdown report in the skill's format, nothing else.
