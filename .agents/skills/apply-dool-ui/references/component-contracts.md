# Component contracts

These contracts define composition and behavior. Reuse an existing implementation when available; create a shared implementation under `components/ui/` once two routes need the pattern.

## Page shell

```text
PageShell
├── shared ambient background
└── constrained content
    ├── PageHeader
    └── route content
```

The shell owns page background, responsive page padding, and `max-w-6xl`. It never owns route-specific data fetching. A route may use its own shell while unique; extract it when a second route needs the same composition.

## Page and section headings

A page header contains an optional back link or eyebrow, exactly one `h1`, a concise description, and actions aligned after the title on larger screens. A section heading uses an `h2`, may include an eyebrow, and may show a count label aligned opposite the title.

Suggested shared API:

```ts
type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  countLabel?: string;
};
```

Do not use typography alone to fake a heading; render the correct semantic element.

## Empty state

Suggested shared API:

```ts
type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};
```

Use a dashed default border, subtle surface, centered text, and generous padding. The title identifies the missing entity, not the implementation state. The description explains what happens next. Render at most one primary action. Examples: “Todavía no tienes eventos” and “Aún no hay asistentes registrados”. Avoid “Sin datos” by itself.

## Loading state

Skeletons use `animate-pulse`, `bg-white/5` or `bg-white/10`, and the same outer grid, card, or table geometry as the final content. Give the container an accessible label such as `aria-label="Cargando eventos"`. Do not use a spinner as the default page or table loading state.

## Data table

```text
rounded bordered surface
└── horizontal overflow wrapper
    └── semantic table with a readable min-width
        ├── thead with scoped column headers
        └── tbody with divided rows
```

Requirements:

- Use `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, and `<td>`.
- Put secondary data below the primary value in the same cell when closely related.
- Align numeric columns consistently, normally centered or right-aligned.
- Keep row actions in the final column and give icon-only controls an accessible name.
- Render `EmptyState` instead of an empty `<tbody>`.
- Use a table-shaped skeleton with the same approximate columns while loading.
- Use a responsive card list instead only when the mobile reading order differs materially from the table.

## Cards and metrics

Cards use a documented surface, border, radius, and padding. Interactive cards are a single link when the entire card navigates; do not nest buttons or links inside that link. Metrics pair the metric typography with a short supporting label. Capacity metrics use `registered / maximum` and a progress bar only when the visual comparison helps.

## Forms and controls

Every input has a visible label. Supporting or error text is associated with `aria-describedby`. Primary and destructive actions use their semantic palette roles. Group actions with `gap-3`; avoid multiple equally prominent primary buttons. Provider errors must be converted into controlled Spanish messages before rendering.

## Route ownership

- One route: keep the component beside the route.
- Two or more routes: move it to `components/`.
- General visual primitive or state: use `components/ui/`.
- Shared types and formatting helpers: use `lib/`; do not redefine them inside visual components.
