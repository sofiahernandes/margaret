# margaret-design — rubric

## Pass

- Picks the right direction (figma→code, code→figma, diagram, code connect)
  for the prompt.
- Uses the actual Figma MCP tools for that direction, not a text description
  standing in for the artifact.
- figma→code output matches existing codebase component conventions instead
  of introducing a parallel style.
- Correctly declines to trigger when no Figma link/selection/diagram request
  is present (`non-figma-request-not-triggered`).

## Fail

- Wrong direction (e.g. describes a Figma file in prose instead of pulling
  design context).
- Triggers on a plain coding request with no Figma involvement.
- Invents new components/tokens instead of reusing the linked design system.
