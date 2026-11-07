# Canonical examples

Read only the pattern needed for the current task. Adapt content and data types, but preserve the semantic structure and documented tokens.

## Page list: data and empty states

```tsx
<section className="py-10" aria-labelledby="events-title">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
        Panel del organizador
      </p>
      <h1 id="events-title" className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Tus eventos
      </h1>
      <p className="mt-3 text-lg text-slate-400">
        Consulta el aforo y las personas registradas.
      </p>
    </div>
  </div>

  {events.length === 0 ? (
    <EmptyState
      title="Todavía no tienes eventos"
      description="Crea tu primer evento para configurar sus tipos de entrada."
      action={<Link href="/organizador">Crear un evento</Link>}
    />
  ) : (
    <div className="mt-9 grid gap-5 md:grid-cols-2">
      {events.map((event) => <EventCard key={event.id} event={event} />)}
    </div>
  )}
</section>
```

Use an actual shared `EmptyState` once the pattern exists in two routes. Until then, route-local markup must follow its contract.

## Page list: loading state

```tsx
export default function EventsLoading() {
  return (
    <section className="animate-pulse py-10" aria-label="Cargando eventos">
      <div className="h-12 w-64 rounded-xl bg-white/10" />
      <div className="mt-4 h-6 w-full max-w-sm rounded-lg bg-white/5" />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-64 rounded-3xl border border-white/10 bg-white/5" />
        ))}
      </div>
    </section>
  );
}
```

The number of placeholder cards is illustrative. Match the normal viewport density of the real layout.

## Data table: populated state

```tsx
<div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85">
  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] border-collapse text-left">
      <thead className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <tr>
          <th scope="col" className="px-5 py-4">Asistente</th>
          <th scope="col" className="px-5 py-4">Tipo de entrada</th>
          <th scope="col" className="px-5 py-4 text-center">Cantidad</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {attendees.map((attendee) => (
          <tr key={attendee.registrationId}>
            <td className="px-5 py-4">
              <p className="font-bold text-slate-100">{attendee.name}</p>
              <p className="mt-1 text-sm text-slate-400">{attendee.email ?? "Sin correo"}</p>
            </td>
            <td className="px-5 py-4 text-slate-300">{attendee.ticketTypeName}</td>
            <td className="px-5 py-4 text-center font-bold text-slate-200">{attendee.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

When `attendees` is empty, replace the entire table surface with the documented empty state; do not render column headers over an empty body.

## Table-shaped loading state

```tsx
<div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85" aria-label="Cargando asistentes">
  <div className="h-14 border-b border-white/10 bg-white/5" />
  <div className="divide-y divide-white/10">
    {[0, 1, 2].map((row) => (
      <div key={row} className="grid grid-cols-3 gap-5 px-5 py-5">
        <div className="h-5 rounded bg-white/10" />
        <div className="h-5 rounded bg-white/5" />
        <div className="h-5 rounded bg-white/5" />
      </div>
    ))}
  </div>
</div>
```

## Incorrect patterns

- Adding purple, orange, or another hue merely to make a screen feel different.
- Choosing `text-3xl` for a page title without a defined typography role.
- Writing only “Sin datos” for an empty state.
- Using a spinner where the final card or table geometry is known.
- Duplicating a table shell or empty-state component already used by another route.
- Adding `"use client"` solely to render styles or static markup.
- Placing interactive controls inside a card that is already one large navigation link.
