---
name: margaret-preflight
description: >
  Run this project's own checks — tests, linter, type checker — and report
  what failed, in the fewest lines that still identify the cause. Falls back
  to the tool's direct invocation when no script is wired up. Use when the
  user says "run the tests", "run the checks", "does this still pass", "lint
  this", "typecheck", "is this green", or as the first step of
  /margaret-ship. Execution only: it runs what the repo already has and
  reports results, it never fixes code, never edits config, and never
  judges design — over-engineering goes to /margaret-scan, security to
  /margaret-guard.
---

Run the repo's checks. Report failures. Fix nothing.

This skill executes tools; it does not form opinions. Every finding traces to a command's exit code, never to judgment.

## Detect, then run

Read the scripts and run what exists, in this order — cheapest signal first, so a type error surfaces before a ten-minute test suite:

1. **typecheck** — `typecheck` script, else `tsc --noEmit` if a `tsconfig.json` exists
2. **lint** — `lint` script, else the linter's own binary if its config is present
3. **test** — `test` script, else the runner implied by the config on disk (`jest.config.*`, `vitest.config.*`, `node --test` over the test dir, `pytest`, `go test ./...`)

Monorepo with several apps? Run each workspace that the diff touches, not all of them.

**No script, but the tool is there — run it directly and say so**, one line: `typecheck: no script, ran tsc --noEmit directly`. Working on an unconfigured repo beats refusing to start.

**Neither script nor tool** — skip that check and name it in the gap list. Never invent a command that can't exist.

Never pass `--fix`, `--write`, `-u`, or a snapshot-update flag. Those edit code, and this skill reports.

## Reporting shape

Lead with the verdict. One line per check:

```
typecheck  pass
lint       pass  (no script, ran eslint directly)
test       FAIL  3 of 148
```

Then, per failure, the shortest excerpt that identifies the cause — the assertion line, the file:line, the rule name. **Never paste a whole log.** A 2,000-line jest dump buys nothing a four-line excerpt doesn't:

```
test  src/utils/slug.test.ts:22
      expected 'a-b', received 'a--b'
lint  src/app/page.tsx:91  react-hooks/exhaustive-deps
```

All green with nothing missing: `All checks pass.` and stop.

## Gaps

List missing checks once, at the end, one line each: `no test command configured`. Name them, propose nothing — `/margaret-init` owns repo-config fixes, and repeating the offer on every run is nagging.

## Handing off to the scan

When dead-code or duplication tooling is already installed (`knip`, `ts-prune`, `jscpd`, `depcheck`), run it too and pass the findings to `/margaret-scan` as **evidence**, so the scan confirms rather than re-derives by reading. Never install one of these to make that possible.

Both skills stand alone: `/margaret-scan` works fine without this evidence, and this skill is complete without the scan.

## Out of scope

Doesn't fix failures, doesn't edit config, doesn't add tests, doesn't judge whether code is over-built or unsafe. Report, then stop — the caller decides what happens next.
