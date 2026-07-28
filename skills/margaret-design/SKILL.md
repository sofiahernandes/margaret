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

Bridge to Figma, both directions. Delegates to the sibling `figma` plugin's own skills rather than reimplementing Figma access — this skill only routes to the right one and supplies the project context (existing tokens, stack, component conventions) that a bare invocation of those skills wouldn't have. Six modes, pick by intent or by the explicit argument.

## Generate new artifacts

- **design** (default): generate a new screen or component design from the given prompt or spec. Route to `figma:figma-generate-design`.
- **diagram**: generate a flowchart, architecture, or sequence diagram. Route to `figma:figma-generate-diagram` for a standalone diagram, or `figma:figma-use-figjam` when the request is explicitly a FigJam working/brainstorm board rather than a diagram meant to sit in Figma alongside product design.

Ask for missing specifics (target file, spec, tokens) before generating — don't invent design intent that wasn't given.

## Pull an existing file/selection into code

- **code**: convert the given frame/component into working code. Route to `figma:figma-design-to-code`. Match this project's existing stack, component conventions, and styling approach — don't introduce a new one. Reuse existing design tokens/theme variables if the project has them instead of hardcoding values pulled from Figma.
- **context**: pull structure, tokens, spacing, and component names from the file/selection and summarize — no code generated. Route to `figma:figma-use`. Use before a bigger build when the user wants to see what's there first.
- **connect**: link existing code components to their Figma counterparts via Code Connect, so the Figma design panel resolves to the real implementation instead of a generic suggestion. Route to `figma:figma-code-connect`.
- **motion**: read the motion/animation spec on the selection (transitions, easing, duration, triggers) and implement the equivalent in code using whatever animation approach the project already uses. Route to `figma:figma-implement-motion`.

If no Figma file or selection was given for a pull mode, ask for one before proceeding — do not guess at a design. If the `figma` plugin isn't connected in this session, say so and stop — don't attempt Figma access any other way.

## Boundaries

Both directions of the Figma bridge live here — generate and pull are not split across separate commands. For code review or over-engineering, use `/margaret-scan`; for security, `/margaret-guard`.
