# margaret-help — rubric

## Pass

- Output lists every real command/mode: `/margaret` (+ lean/full/max/off),
  `/margaret default <mode>`, `/margaret-scan`, `/margaret-guard`,
  `/margaret-design`, "stop margaret"/"normal mode".
- Triggers on natural-language asks ("what margaret commands"), not just the
  slash command.
- Leaves mode state untouched — running it doesn't switch or persist a mode.
- Single response, no follow-up prompts.

## Fail

- Lists a command/flag that doesn't exist, or omits a real one (check
  against `commands/*.toml` and `skills/*/SKILL.md` in the repo root).
- Changes the active mode as a side effect.
- Only fires on the exact slash command, ignoring natural-language phrasing.
