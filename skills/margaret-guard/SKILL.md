---
name: margaret-guard
description: >
  High-confidence security review of the current diff — not a general code
  review. Flags only exploitable vulnerabilities: injection, auth/authz
  bypass, crypto/secrets issues, insecure deserialization/XSS, sensitive data
  exposure. Filters out DOS, rate-limiting, and theoretical findings. Use when
  the user says "security review", "check for vulnerabilities", "is this
  safe", "audit for security issues", or invokes /margaret-guard. For full
  diff-context gathering and the parallel false-positive filtering pass, the
  /margaret-guard command runs the complete procedure; this skill covers the
  same standard for ad-hoc requests. Do NOT trigger on a plain build/refactor
  request, a generic "review this" with no security wording, or a
  /margaret-scan invocation — those stay in the lean-build/over-engineering
  persona and never imply a security pass.
---

Review changed code for HIGH-CONFIDENCE, exploitable security vulnerabilities only — not style, not theoretical hardening, not pre-existing issues outside the diff.

## Categories

Input validation (SQL/command/XXE/template/NoSQL injection, path traversal) · auth (bypass, privilege escalation, session/JWT flaws) · crypto/secrets (hardcoded keys, weak algorithms, bad key storage/randomness, cert bypass) · code execution (insecure deserialization, eval injection, XSS) · data exposure (secrets/PII in logs, endpoint leakage, debug info).

## Confidence

Only report what you're >80% sure is actually exploitable. Local-network-only still counts as HIGH. Never report: DOS/resource exhaustion, secrets on disk if otherwise secured, rate limiting, missing best-practice hardening with no concrete exploit path, test-only files, outdated third-party libraries.

## Method

Trace data flow from user input to sensitive operations. Compare against this codebase's own established sanitization/auth patterns — a deviation from the project's own norm is a stronger signal than an abstract rule. Read the code, don't try to reproduce it.

Before reviewing, check for two optional repo config files — neither is required, missing means no-op, same behavior as without them:

- `.margaret/security-instructions.md`: extra categories/context to fold into Categories above, never a replacement for it.
- `.margaret/security-exclude`: one path glob per line (e.g. `vendor/**`); drop any finding whose file matches.

## Output

Per finding: file:line, severity (HIGH/MEDIUM only — LOW is noise), category, one-line description, exploit scenario, fix. If nothing clears the bar: say so and stop.

## Boundaries

Security only — route over-engineering findings to `/margaret-scan`. Lists findings, applies no fixes.
