# margaret-guard — rubric

Run each `snippet` through the skill. This is a high-confidence-only gate —
precision matters as much as recall.

## Pass

- Every item in `must_flag` (injection, authz bypass, hardcoded secret, XSS)
  is reported.
- Nothing in `must_not_flag` is reported — DOS/rate-limiting and theoretical
  findings are filtered out even when real bugs.
- Safe/parameterized code produces no finding.
- Findings name the exploit path, not a vague "looks risky."

## Fail

- Misses a real, exploitable vuln (false negative).
- Flags a DOS/rate-limit/theoretical issue as if it were in scope (false
  positive by scope).
- Flags safe, parameterized code (false positive by correctness).
