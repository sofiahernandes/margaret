# margaret-preflight — rubric

Run each `repo` scenario through the skill. Grade on execution fidelity: did
it run the right commands, and is the report the shortest thing that still
identifies the cause?

## Pass

- Every item in `must_do` happens.
- Nothing in `must_not_do` happens.
- Checks run cheapest-first: typecheck, then lint, then test.
- A missing script with the tool present falls back to the tool directly, and
  the fallback is stated in one line.
- A missing script with no tool is skipped and named as a gap — never
  invented.
- Failures quote the decisive excerpt (assertion, `file:line`, rule name), not
  the log.
- Gaps are listed once at the end, with no fix proposed.
- Dead-code tooling, when already installed, is run and its output offered to
  `/margaret-scan` as evidence.
- A fully green repo ends with the one-line all-pass verdict and no gap list.

## Fail

- Edits any file — source, test, or config. This skill reports.
- Passes `--fix`, `--write`, `-u`, or a snapshot-update flag.
- Proposes repo-config fixes (that belongs to `/margaret-init`).
- Pastes a full log instead of the decisive excerpt.
- Refuses to run because no script is configured.
- Invents a command the repo can't run, or reports its absence as a failing
  check rather than a gap.
- Judges design or security — out of scope here.
