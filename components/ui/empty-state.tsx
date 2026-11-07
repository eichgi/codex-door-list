import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  headingLevel = "h2",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 py-12 text-center sm:px-8">
      <Heading className="text-2xl font-bold">{title}</Heading>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
