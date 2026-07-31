# Benchmark

Three arms (no skill, [caveman](https://github.com/JuliusBrussee/caveman), margaret), three models, five everyday tasks, **10 runs per cell, median reported**. Code LOC is counted from fenced code blocks; tokens, cost, and latency come straight from the API.

## Reproduce

### Claude (Haiku / Sonnet / Opus)

Requires an Anthropic API key and **Node.js ≥ 22.22.0** (promptfoo's engine constraint,
check with `node --version` and upgrade if needed):

```bash
cp ../.env.example .env      # add your ANTHROPIC_API_KEY
npx promptfoo@latest eval -c promptfooconfig.yaml --env-file ../.env --repeat 10
npx promptfoo@latest view
```

`--env-file ../.env` is required because promptfoo reads `.env` from the current
directory (`benchmarks/`), not the repo root where the file lives.

Tasks: email validator, JS debounce, CSV sum, React countdown, FastAPI rate-limit (see `promptfooconfig.yaml`). Single-shot completions, default temperature.

## Metrics

| File | Metric | Behavior |
|------|--------|----------|
| `loc.js` | `code_loc` | Measurement - always passes, records line count |
| `correctness.js` | `correct` | Gate - fails if generated code doesn't work |

`correctness.js` extracts fenced code blocks and runs per-task checks (spawns Python/Node for email, debounce, CSV; structural regex for React and FastAPI). A broken one-liner that scores great on LOC will fail on correctness.

> **Note:** The React countdown and FastAPI rate-limit checks are keyword/structural only (no runtime execution), so they verify plausible structure rather than full correctness. The email, debounce, and CSV checks execute the code.

### Prerequisites

Running the benchmark requires **Python 3**, **pandas**, and **Node.js ≥ 22.22.0** (promptfoo's engine constraint; see [Reproduce](#reproduce)).

## Notes

- Caveman is a prose-compression skill (it leaves code "normal"), so it lands between baseline and margaret on code size and wins mainly on prose tokens.
- Cost reflects single-shot calls (one prompt, one completion), not real multi-turn agent sessions. In a session the ruleset re-injects and the screen deliberates every turn across many turns, so per-session cost can come out higher or lower than these numbers. Prompt caching offsets some of the re-injection.
- These are everyday tasks. For production-grade specs, where an unconstrained agent bloats much harder, the numbers will differ — no `results/` baseline exists yet for margaret; run `npx promptfoo@latest eval` above and commit the first one here once available.
- No results have been recorded yet. Until a run lands in `results/`, treat any LOC claim for margaret as unverified — this harness exists precisely so that stops being true.
