# Evals

Pass/fail criteria and mock tasks for every margaret skill. Where
`benchmarks/` already measures a skill quantitatively (code size, cost,
runtime correctness), evals here add the judgment-based checks that harness
can't grade automatically — reused, not duplicated.

One folder per skill, each with:

- `tasks.json` — mock inputs (a diff, a repo snapshot, a query)
- `RUBRIC.md` — the pass/fail bar for that skill's output

| Skill | Folder | Grading |
|---|---|---|
| `margaret` (build persona) | [`margaret/`](margaret/) | smallest-solution rubric + `../benchmarks` (code_loc, correct) |
| `margaret-scan` | [`margaret-scan/`](margaret-scan/) | known-bloat recall/precision |
| `margaret-guard` | [`margaret-guard/`](margaret-guard/) | known-vuln recall + known-safe precision |
| `margaret-design` | [`margaret-design/`](margaret-design/) | direction + fidelity checklist |
| `margaret-help` | [`margaret-help/`](margaret-help/) | completeness + one-shot-only checklist |

## Running

These are grading rubrics, not an executable harness — score by hand or via
an agent: run each `tasks.json` prompt against the skill, check the output
against that folder's `RUBRIC.md`. `margaret/`'s coding tasks additionally
run through `../benchmarks` for automated `code_loc`/`correct` scoring
(`cd ../benchmarks && npx promptfoo@latest eval`).

## Shared bar: smallest perfect solution

Every skill is graded against the same failure modes, restated per skill in
its rubric:

- **Under-build**: misses part of the actual requirement, or the output is
  wrong/unsafe.
- **Right-size**: meets the requirement exactly, at the first rung of the
  screen (repo reuse → stdlib → platform → dep already installed → one line →
  minimal custom) that clears it.
- **Over-build**: adds abstraction, config, or scope the task didn't ask for.

Pass = right-size. Both under- and over-build are failures.
