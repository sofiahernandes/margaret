---
name: margaret-design
description: >
  Figma bridge, both directions: generate a new Figma design or diagram from
  a prompt/spec, or pull an existing Figma file/selection into this codebase
  (as code, a design-context summary, a Code Connect link, or a motion
  implementation). Use when the user asks to create/generate something in
  Figma or FigJam, wants a diagram drawn, gives a Figma link/selection and
  asks to build it, wants design tokens/structure summarized, wants
  components linked to Figma, or wants a Figma animation implemented. Also
  invoked via /margaret-design. Do NOT trigger on a plain
  code build/refactor request, a /margaret or /margaret-scan invocation, or
  any task with no explicit Figma/FigJam mention or link — never infer
  design-tool intent from ordinary coding language like "build" or
  "generate".
argument-hint: "[design|diagram|code|context|connect|motion]"
---

Bridge to Figma, both directions. Doesn't reimplement Figma access — routes to whatever Figma capability this session has, and supplies the project context (existing tokens, stack, component conventions) that a bare invocation wouldn't have. Six modes, pick by intent or by the explicit argument.

## Generate new artifacts

- **design** (default): generate a new screen or component design from the given prompt or spec. Route to `figma:figma-generate-design`.
- **diagram**: generate a flowchart, architecture, or sequence diagram. Route to `figma:figma-generate-diagram` for a standalone diagram, or `figma:figma-use-figjam` when the request is explicitly a FigJam working/brainstorm board rather than a diagram meant to sit in Figma alongside product design.

Ask for missing specifics (target file, spec, tokens) before generating — don't invent design intent that wasn't given.

## Pull an existing file/selection into code

- **code**: convert the given frame/component into working code. Route to `figma:figma-design-to-code`. Match this project's existing stack, component conventions, and styling approach — don't introduce a new one. Reuse existing design tokens/theme variables if the project has them instead of hardcoding values pulled from Figma.
- **context**: pull structure, tokens, spacing, and component names from the file/selection and summarize — no code generated. Route to `figma:figma-use`. Use before a bigger build when the user wants to see what's there first.
- **connect**: link existing code components to their Figma counterparts via Code Connect, so the Figma design panel resolves to the real implementation instead of a generic suggestion. Route to `figma:figma-code-connect`.
- **motion**: read the motion/animation spec on the selection (transitions, easing, duration, triggers) and implement the equivalent in code using whatever animation approach the project already uses. Route to `figma:figma-implement-motion`.

If no Figma file or selection was given for a pull mode, ask for one before proceeding — do not guess at a design.

## Finding the Figma capability

Route by what's reachable in this session, not by a hardcoded server name. Check in order, use the first that answers:

1. The sibling `figma` plugin's skills (`figma:figma-design-to-code`, `figma:figma-generate-design`, …) — richest path, Claude Code only.
2. Any other connected Figma MCP server. Tool names differ between servers, so match on **capability** — fetching a node's structure from a file key, rendering a frame to an image, reading variables — never on a specific tool name.
3. Nothing connected: say which host-level setup is missing and stop. Don't guess at a design, and don't scrape figma.com.

Say which path you took when it isn't the first — downstream fidelity depends on it, and the user should know whether they got design-context data or a screenshot.

## Pulling a design into this codebase

The output of `code` mode is **everything the codebase needs for that design to actually run** — not just a component file. What that includes is per project: a component plus its stylesheet in one repo; a component, a CMS schema, and a registry entry in another. Trace how a comparable existing feature is wired end to end, then match it. A component that renders nowhere because its registration is missing is not a delivered design.

Infer the conventions from the repo itself — read a comparable existing component and follow it. Agent context files (`AGENTS.md`, `CLAUDE.md`, `.margaret/conventions.md`, an in-repo docs tree) are reference points, not a substitute for reading the code they describe: they go stale, the code doesn't.

Shared files — a registry, a barrel export, a route table — are edited by appending one entry in the existing style. Never reorder or reformat them; other features live there.

## Tokens

The design system wins over the Figma frame.

Map every value to the token the project already has — a CSS variable, a theme key, a Tailwind token. When a value maps to nothing, **propose a new token in the project's own naming scheme and ask** before using it. Never hardcode a hex pulled from Figma, and never invent a near-duplicate of a token that already exists under a different name. Two tokens for the same colour is a design system with a bug in it.

Spacing, radii, and type scales follow the same rule as colour.

## Boundaries

Both directions of the Figma bridge live here — generate and pull are not split across separate commands. For code review or over-engineering, use `/margaret-scan`; for security, `/margaret-guard`.
