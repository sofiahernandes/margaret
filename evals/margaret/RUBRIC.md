# margaret (build persona) — rubric

Pass/fail per task in `tasks.json`. For the five shared coding tasks, also
run `../../benchmarks` for `code_loc` (lower is better, informational) and
`correct` (gate — must pass).

## Pass

- Lands on the rung named in `expects_rung`, or a simpler one that still
  satisfies the requirement.
- Output is correct and complete for the stated ask.
- If the ask is broad, ships the minimal version and states the larger scope
  in the same reply (does not stall on a question it can default).
- Trust-boundary/safety logic (auth, validation, data loss) is present even
  when everything else is trimmed.

## Fail

- Matches the task's `fail_if` condition.
- Over-build: adds an abstraction, dependency, or config knob the task didn't
  need.
- Under-build: skips part of the requirement, or the output is wrong.
- Explanation longer than the code, with nothing cut to justify it.
