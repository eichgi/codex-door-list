# Dool design tokens

Use these exact roles. Prefer shared components that already encode them instead of repeating class strings.

## Palette

| Semantic role | Tailwind classes |
| --- | --- |
| Page background | `bg-slate-950` |
| Primary surface | `bg-slate-900/85` or `bg-slate-900/90` |
| Subtle surface | `bg-white/5` |
| Elevated interactive surface | `bg-slate-800` with `hover:bg-slate-700` |
| Default border | `border-white/10` |
| Emphasized border | `border-sky-300/40` |
| Primary text | `text-white` or `text-slate-100` |
| Secondary text | `text-slate-300` |
| Muted text | `text-slate-400` |
| Subtle text | `text-slate-500` |
| Accent text and links | `text-sky-300` with `hover:text-sky-200` |
| Primary action | `bg-sky-300 text-slate-950` with `hover:bg-sky-200` |
| Destructive action | `bg-red-900 text-red-100` with `hover:bg-red-800` |
| Error surface | `border-red-400/30 bg-red-950/60 text-red-100` |
| Success surface | `border-emerald-400/30 bg-emerald-950/60 text-emerald-100` |

Do not use a different hue merely to distinguish a page. Add a semantic role here only when the product needs a meaning not covered above.

Ambient decoration for a dark application shell may use this exact class on its `layout.tsx` background layer:

```text
bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.13),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_35%)]
```

This is the only approved literal-color exception. Define it once per route family in its layout; do not copy it into leaf pages or components.

## Typography

| Role | Tailwind classes |
| --- | --- |
| Page title | `text-4xl font-bold tracking-tight sm:text-5xl` |
| Hero title | `text-4xl font-bold tracking-tight sm:text-6xl` |
| Section title | `text-2xl font-bold` |
| Card title | `text-xl font-bold tracking-tight` or `text-2xl font-bold tracking-tight` for prominent cards |
| Eyebrow | `text-xs font-bold uppercase tracking-[0.2em] text-sky-300` |
| Body | `text-base leading-7 text-slate-300` |
| Supporting text | `text-sm text-slate-400` |
| Metric | `text-3xl font-bold` |
| Table header | `text-xs font-bold uppercase tracking-[0.14em] text-slate-400` |

Use one `h1` per page. Keep heading levels sequential. Use sentence case for Spanish headings.

## Spacing and layout

| Context | Tailwind classes |
| --- | --- |
| Page padding | `px-5 py-8 sm:px-8 sm:py-10` |
| Public page padding | `px-5 py-10 sm:py-16` |
| Content width | `mx-auto w-full max-w-6xl` |
| Main section separation | `mt-12` |
| Heading to content | `mt-6` |
| Card grid | `grid gap-5` |
| Card padding | `p-5 sm:p-6` or `p-6 sm:p-7` for prominent cards |
| Inline controls | `flex flex-wrap items-center gap-3` |
| Form fields | `grid gap-5` |

Use Tailwind's standard spacing scale. Avoid bracketed spacing values such as `gap-[18px]` or `p-[22px]`.

## Shape and motion

- Controls: `rounded-xl`.
- Standard cards and state containers: `rounded-2xl`.
- Prominent cards and major empty states: `rounded-3xl`.
- Progress tracks and badges: `rounded-full`.
- Default transition: `transition`; do not add long or decorative animation.
- Interactive cards may use `hover:-translate-y-0.5`.
- Always retain a visible keyboard focus indicator; use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` when the native focus is insufficient.

## Responsive baseline

Start with the narrow layout. Add columns at `sm`, `md`, or `lg` only when the content remains readable. Data tables use an overflow wrapper and a documented minimum width rather than compressing columns until their contents become illegible.
