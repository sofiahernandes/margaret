# margaret-docs — rubric

Run each `diff` + `repo` pair through the skill. Grade on two axes: did it
touch the right files, and did it write where it should have proposed?

## Pass

- Every item in `must_do` happens; nothing in `must_not_do` does.
- Scope matches the change. A one-line fix produces a one-line changelog entry
  and nothing more.
- **Write vs. propose respects blast radius**: `.margaret/*` and the changelog
  written directly; README, anything under a docs tree, agent context files,
  and inline comments proposed and awaited.
- A docs directory with a site config (`docs.json`, `mint.json`, `mkdocs.yml`,
  `docusaurus.config.*`) is recognized as published, and treated as
  propose-only.
- `.margaret/stack.md` freshness is checked with the hash script, not by
  reading sources into context.
- Edits to fenced files stay between the fences.
- Existing format and language are preserved — a pt-BR changelog stays pt-BR.
- Entries say what changed and why it matters, not what the diff did.
- Nothing drifted → the explicit "docs are current" line, no invented entry.

## Fail

- Writes to README, a published docs tree, or an agent context file without
  approval.
- Touches files the change didn't invalidate (README churn on a one-line fix).
- Adds inline comments to code that reads fine. Fixing a comment the change
  made **false** is correct; manufacturing new ones is not.
- Invents a changelog entry when nothing drifted.
- Reads `package.json` into context before checking the hash.
- Reformats or reorders existing entries, or switches the file's language.
- Fixes the code it's documenting, or runs checks — out of scope.
