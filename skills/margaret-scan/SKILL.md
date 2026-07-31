---
name: margaret-scan
description: >
  Review focused exclusively on over-engineering. Scoped to the current diff
  by default, or the whole repo when asked to audit. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative
  abstractions, dead flexibility. One line per finding: location, what to cut,
  what replaces it. Use when the user says "review for over-engineering",
  "what can we delete", "is this over-engineered", "audit this codebase",
  "audit for over-engineering", "find bloat", "simplify review", or invokes
  /margaret-scan. Complements correctness-focused review, this one only hunts
  complexity.
argument-hint: "[repo]"
---

Hunt exclusively for complexity that doesn't earn its keep. One finding per line: where it lives, what to remove, what stands in its place. Success looks like a smaller tree, not a longer report.

Two scopes:

- **diff** (default): only the current change is in play.
- **repo** (pass `repo`, or the user asks for an "audit"/"whole codebase"): walk the full tree instead, biggest win listed first. Look for: packages duplicating stdlib or platform behavior, interfaces with exactly one implementer, factories manufacturing a single product, pass-through wrappers that add no behavior, single-export files, unused flags/config, and homegrown reimplementations of stdlib functions.

## Reporting shape

`L<line>: <tag> <finding>. <fix>.` — prefix with `<file>:` for anything spanning multiple files (diffs with several files, or a repo scan).

Tags:

- `cut:` unreachable code, unused flexibility, a feature nobody asked for. Fix: remove it, nothing replaces it.
- `builtin:` custom code duplicating what the standard library already ships. Name the stdlib call.
- `platform:` a dependency or handwritten code standing in for a platform capability. Name the capability.
- `overbuilt:` one-implementation interface, a config knob nobody flips, a layer with a single caller.
- `condense:` identical behavior expressible in fewer lines. Show the shorter version.

## Examples

❌ "This `SlugGenerator` class seems like it might be handling more cases than strictly necessary — worth double-checking whether every branch is needed?"
✅ `L18-45: builtin: 30-line slug class reimplementing string normalization. str.lower().replace(' ', '-') plus a regex strip, 2 lines.`
✅ `L7: platform: left-pad package pulled in for one call. "x".padStart(5, "0"), 0 deps.`
✅ `store.py:L61: overbuilt: PaymentGatewayInterface with one implementer (Stripe). Inline the Stripe class until a second gateway is real.`
✅ `L40-58: cut: exponential backoff wrapper around a call that's already idempotent and fast. Nothing replaces it.`
✅ `L22-33: condense: hand-written merge of two dicts field by field. {**a, **b}, 1 line.`

## Closing line

End every scan with the number that matters: `net: -<N> lines possible.` (repo scope also reports `-<M> deps possible.`)
Nothing to cut? Say `Already lean. Ship it.` and stop there.

## Out of scope

This is a complexity-only pass. Correctness bugs, security gaps, and performance regressions are not this skill's job — send those to `/margaret-guard` or a standard review instead. A lone smoke test or `assert`-based self-check counts as the margaret baseline, not bloat — never list it as a cut. This skill reports findings, it never applies them, and it doesn't touch the active mode.
