"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatChartDate } from "@/lib/dates";
import type { DailyRegistrationsResponse } from "@/lib/types";

type ChartState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: DailyRegistrationsResponse };

const chartWidth = 720;
const chartHeight = 280;
const chartPadding = { top: 18, right: 18, bottom: 42, left: 44 };

function isDailyRegistrationsResponse(
  value: unknown,
): value is DailyRegistrationsResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<DailyRegistrationsResponse>;

  return (
    (typeof response.publishedAt === "string" || response.publishedAt === null) &&
    Array.isArray(response.registrations) &&
    response.registrations.every(
      (point) =>
        point &&
        typeof point.date === "string" &&
        typeof point.count === "number",
    )
  );
}

function LoadingChart() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/10 bg-slate-900/85 p-5 sm:p-6"
      aria-label="Cargando registros por día"
    >
      <div className="h-5 w-36 rounded-lg bg-white/10" />
      <div className="mt-3 h-8 w-52 rounded-lg bg-white/10" />
      <div className="mt-6 h-64 rounded-xl bg-white/5 sm:h-72" />
    </div>
  );
}

function DailyRegistrationsChart({ data }: { data: DailyRegistrationsResponse }) {
  const points = data.registrations;
  const total = points.reduce((sum, point) => sum + point.count, 0);
  const maxCount = Math.max(1, ...points.map((point) => point.count));
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const x = (index: number) =>
    chartPadding.left +
    (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
  const y = (count: number) =>
    chartPadding.top + innerHeight - (count / maxCount) * innerHeight;
  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.count)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(points.length - 1)} ${chartPadding.top + innerHeight} L ${x(0)} ${chartPadding.top + innerHeight} Z`;
  const labelCount = Math.min(5, points.length);
  const labelIndexes = Array.from(
    new Set(
      Array.from({ length: labelCount }, (_, index) =>
        Math.round((index / Math.max(1, labelCount - 1)) * (points.length - 1)),
      ),
    ),
  );
  const yTicks = Array.from(new Set([0, Math.ceil(maxCount / 2), maxCount]));

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/85 p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-3xl font-bold">{total}</p>
          <p className="mt-1 text-sm text-slate-400">
            entradas registradas desde la publicación
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Máximo diario: <span className="font-bold text-slate-200">{maxCount}</span>
        </p>
      </div>

      <svg
        className="mt-6 h-64 w-full sm:h-72"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        role="img"
        aria-labelledby="daily-chart-title daily-chart-description"
      >
        <title id="daily-chart-title">Registros diarios</title>
        <desc id="daily-chart-description">
          {`${total} entradas registradas en ${points.length} días desde la publicación.`}
        </desc>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={chartPadding.left}
              x2={chartWidth - chartPadding.right}
              y1={y(tick)}
              y2={y(tick)}
              className="stroke-white/10"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={chartPadding.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-slate-400 text-xs"
            >
              {tick}
            </text>
          </g>
        ))}

        <path d={areaPath} className="fill-sky-300/10" />
        <path
          d={linePath}
          fill="none"
          className="stroke-sky-300"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.length <= 31 &&
          points.map((point, index) => (
            <circle
              key={point.date}
              cx={x(index)}
              cy={y(point.count)}
              r="4"
              className="fill-slate-950 stroke-sky-300"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${formatChartDate(point.date)}: ${point.count}`}</title>
            </circle>
          ))}

        {labelIndexes.map((index) => (
          <text
            key={points[index].date}
            x={x(index)}
            y={chartHeight - 12}
            textAnchor="middle"
            className="fill-slate-400 text-xs"
          >
            {formatChartDate(points[index].date)}
          </text>
        ))}
      </svg>

      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.date}>
            {formatChartDate(point.date)}: {point.count} entradas registradas
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RegistrationChart({ eventId }: { eventId: string }) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState<ChartState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadRegistrations() {
      setState({ status: "loading" });

      try {
        const response = await fetch(
          `/api/eventos/${encodeURIComponent(eventId)}/inscripciones-por-dia`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { error?: unknown }
            | null;
          throw new Error(
            typeof body?.error === "string"
              ? body.error
              : "No fue posible cargar los registros del evento.",
          );
        }

        const body: unknown = await response.json();
        if (!isDailyRegistrationsResponse(body)) {
          throw new Error("No fue posible interpretar los registros del evento.");
        }

        setState({ status: "success", data: body });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "No fue posible cargar los registros del evento.",
        });
      }
    }

    void loadRegistrations();
    return () => controller.abort();
  }, [eventId, requestKey]);

  if (state.status === "loading") return <LoadingChart />;

  if (state.status === "error") {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-950/60 p-5 text-red-100 sm:p-6">
        <h3 className="text-xl font-bold tracking-tight">No pudimos cargar la gráfica</h3>
        <p className="mt-2 text-sm leading-6">{state.message}</p>
        <button
          type="button"
          onClick={() => setRequestKey((key) => key + 1)}
          className="mt-5 rounded-xl bg-sky-300 px-4 py-2 font-bold text-slate-950 transition hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!state.data.publishedAt) {
    return (
      <EmptyState
        headingLevel="h3"
        title="Este evento aún no está publicado"
        description="La actividad diaria aparecerá aquí a partir del día en que publiques el evento."
      />
    );
  }

  if (state.data.registrations.every((point) => point.count === 0)) {
    return (
      <EmptyState
        headingLevel="h3"
        title="Aún no hay registros para este evento"
        description="La gráfica comenzará a mostrar actividad cuando llegue la primera inscripción."
      />
    );
  }

  return <DailyRegistrationsChart data={state.data} />;
}
