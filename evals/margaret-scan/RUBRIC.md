# margaret-scan — rubric

Run each `snippet` through the skill. Score recall and precision against
`must_flag` / `must_not_flag`.

## Pass

- Every item in `must_flag` appears as a finding, on the same target.
- Each tag is one of the skill's five — `cut`, `builtin`, `platform`,
  `overbuilt`, `condense` — and is the right one where the snippet leaves no
  ambiguity. The skill is the only source for this vocabulary; a tag from
  anywhere else is drift, which is how `delete`/`stdlib`/`native`/`yagni`/
  `shrink` once went unnoticed in the command prompt.
- Nothing in `must_not_flag` is raised as a finding.
- Each finding follows the skill's line format: location, what to cut, what
  replaces it.
- Correctness/security snippets (`correctness-bug-out-of-scope`) get no
  over-engineering finding — noted as out of scope at most.
- A clean snippet with nothing to cut gets the skill's explicit "nothing to
  cut" line, not an invented finding.

## Fail

- Misses anything in `must_flag` (false negative).
- Flags anything in `must_not_flag` (false positive) — including a real
  two-implementation abstraction, or a correctness bug reported as
  over-engineering.
- Proposes a fix instead of reporting the finding (scan is report-only).
