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
  /margaret-guard command runs the complete procedure on top of this skill,
  which is the single source for what counts as a finding. Do NOT trigger on a plain build/refactor
  request, a generic "review this" with no security wording, or a
  /margaret-scan invocation — those stay in the lean-build/over-engineering
  persona and never imply a security pass.
---

Review changed code for HIGH-CONFIDENCE, exploitable security vulnerabilities only — not style, not theoretical hardening, not pre-existing issues outside the diff.

## Categories

Input validation (SQL/command/XXE/template/NoSQL injection, path traversal) · auth (bypass, privilege escalation, session/JWT flaws) · crypto/secrets (hardcoded keys, weak algorithms, bad key storage/randomness, cert bypass) · code execution (insecure deserialization, eval injection, XSS) · data exposure (secrets/PII in logs, endpoint leakage, debug info).

## Confidence

Only report what you're >80% sure is actually exploitable. Local-network-only still counts as HIGH.

Scale: 0.9-1.0 certain exploit path · 0.8-0.9 clear known pattern · 0.7-0.8 needs specific conditions · below 0.7 don't report.

### Never report

DOS/resource exhaustion · secrets on disk if otherwise secured · rate limiting · memory/CPU exhaustion · missing validation on non-security fields with no proven impact · sanitization in CI workflow inputs unless clearly reachable from untrusted input · missing hardening best-practices with no concrete vulnerability · theoretical race conditions and timing attacks · outdated third-party libraries (tracked elsewhere) · memory-safety bugs in memory-safe languages · test-only files · log spoofing from unsanitized input · SSRF controlling only the path, not host or protocol · user content in AI system prompts · regex injection · regex DOS · findings in documentation files · missing audit logs.

### Precedents

Logging secrets in plaintext is a vulnerability; logging URLs is not. UUIDs are unguessable, no validation needed. Env vars and CLI flags are trusted input. Memory and FD leaks are not valid findings. Tabnabbing, XS-Leaks, prototype pollution, and open redirect only at extremely high confidence. React and Angular are XSS-safe unless `dangerouslySetInnerHTML` / `bypassSecurityTrustHtml` or similar is in play. GitHub Actions findings need a concrete, specific attack path — most aren't exploitable in practice. Client-side JS/TS missing an auth or permission check is not a vulnerability; the server is responsible. MEDIUM only when obvious and concrete. Notebook (`.ipynb`) findings need a concrete untrusted-input path. Logging non-PII sensitive-looking data is not a vulnerability — only secrets, passwords, and PII count. Shell-script command injection is rarely exploitable in practice — only with a concrete untrusted-input path.

## Method

1. **Repo context** — find the security frameworks, sanitization patterns, and threat model already in place.
2. **Comparative** — where does this diff deviate from the codebase's own established secure patterns? A deviation from the project's own norm is a stronger signal than an abstract rule.
3. **Per-file** — trace data flow from user input to sensitive operations, look for privilege boundaries crossed unsafely, identify injection points and unsafe deserialization.

Read the code to decide whether a finding is real — never run commands to reproduce a vulnerability, and never write to a file.

Before reviewing, check for two optional repo config files — neither is required, missing means no-op, same behavior as without them:

- `.margaret/security-instructions.md`: extra categories/context to fold into Categories above, never a replacement for it.
- `.margaret/security-exclude`: one path glob per line (e.g. `vendor/**`); drop any finding whose file matches.

## Output

Per finding: `file:line`, severity, category, one-line description, exploit scenario, fix.

```markdown
# Vuln 1: XSS: `foo.py:42`

* Severity: High
* Description: user input from `username` is interpolated into HTML unescaped
* Exploit Scenario: attacker crafts a URL with a `<script>` payload that runs in the victim's browser
* Recommendation: escape via the templating engine's auto-escaping
```

Severity: **HIGH** (RCE, breach, auth bypass — directly exploitable) · **MEDIUM** (needs specific conditions, real impact) · **LOW** is noise, never reported.

Nothing clears the bar: say so and stop.

## Boundaries

Security only — route over-engineering findings to `/margaret-scan`. Lists findings, applies no fixes.
