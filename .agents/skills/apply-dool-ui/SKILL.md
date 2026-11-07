---
name: apply-dool-ui
description: Apply or review the Dool visual system when creating or modifying user-facing pages, layouts, components, tables, forms, navigation, loading states, empty states, or styling in this repository. Do not use for backend-only, database, email, documentation, or infrastructure changes with no rendered UI.
---

# Apply Dool UI

Keep every user-facing change consistent with the project's dark slate and sky visual system. Explicit user requirements take precedence; keep deliberate exceptions local and call them out in the handoff.

## References

- Always read [references/design-tokens.md](references/design-tokens.md) before choosing styles.
- Read [references/component-contracts.md](references/component-contracts.md) when adding or changing page structure, shared UI, tables, empty states, or loading states.
- Read only the relevant sections of [references/canonical-examples.md](references/canonical-examples.md) when implementing one of its named patterns.

Treat the repository's shared components as the implementation source of truth. If a reference and an existing shared component disagree, preserve the component's public API and reconcile the reference in the same change when appropriate.

## Workflow

1. Inspect the affected route and neighboring shared components.
2. Identify applicable default, loading, empty, error, and narrow-viewport states.
3. Reuse an existing component contract before creating new markup.
4. Keep a component beside its route when only that route uses it; move it to `components/` when two or more routes use it.
5. Use Server Components by default. Add `"use client"` only for state, effects, events, or browser APIs.
6. Use Spanish for visible interface text and English for code identifiers and types.
7. Verify semantic headings, keyboard access, visible focus, sufficient labels, responsive behavior, and the applicable alternate states.
8. Run `node .agents/skills/apply-dool-ui/scripts/check-ui-conventions.mjs` followed by the relevant repository checks.

## Invariants

- Use the semantic palette, typography roles, spacing, and shapes in `design-tokens.md`.
- Do not introduce literal hex, RGB, or HSL colors in route or component code, except for the exact approved ambient gradient in a page `layout.tsx`.
- Do not introduce arbitrary Tailwind spacing when a documented spacing value fits.
- Do not invent a new visual variant when an existing semantic role or component covers it.
- Loading skeletons must approximate the geometry of the content they replace.
- Empty states must name what is empty and, when useful, offer at most one primary next action.
- Tables must have semantic headers, horizontal overflow protection, and explicit loading and empty presentations.
- Do not add decorative imagery or icons unless they improve comprehension or the user requests them.

## Completion criteria

A UI change is complete when it follows a documented visual role and component contract, covers every applicable state, works on mobile and desktop, introduces no unexplained one-off values, and passes the UI convention checker plus relevant project checks.
