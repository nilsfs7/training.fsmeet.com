import { durationSuffix, feelingSeries, formatDuration, formatFeeling, type ActivityPoint, type ActivitySpan } from "@/lib/stats";
import type { DurationUnit } from "@/lib/types";

const WIDTH = 320;
const HEIGHT = 168;
const LEFT = 8;
const RIGHT = 312;
const TOP = 16;
const BOTTOM = 132;

export function ActivityChart({
  points,
  metric,
  span,
  durationUnit = "hours",
}: {
  points: ActivityPoint[];
  metric: "sessions" | "minutes" | "feeling";
  span: ActivitySpan;
  durationUnit?: DurationUnit;
}) {
  const amount = (point: ActivityPoint): number | null => {
    if (metric === "feeling") return point.feeling;
    return metric === "sessions" ? point.sessions : point.minutes;
  };
  const plotted = metric === "feeling" ? feelingSeries(points) : points;
  const max = metric === "feeling" ? 10 : Math.max(...plotted.map((point) => amount(point) ?? 0), 1);
  const ratio = (point: ActivityPoint): number => {
    const current = amount(point) ?? 0;
    if (metric === "feeling") return (current - 1) / 9;
    return current / max;
  };
  const unit = metric === "sessions" ? (max === 1 ? "session" : "sessions") : durationSuffix(durationUnit);
  const labels = labelIndexes(plotted.length, span === "year" && metric !== "feeling");
  const summary = plotted
    .filter((point) => {
      const current = amount(point);
      return current != null && current > 0;
    })
    .map((point) => {
      const current = amount(point) ?? 0;
      const rendered = metric === "feeling"
        ? formatFeeling(current)
        : metric === "minutes"
          ? formatDuration(current, durationUnit)
          : String(current);
      const suffix = metric === "sessions" ? "sessions" : metric === "minutes" ? durationSuffix(durationUnit) : "";
      return `${point.label}: ${rendered}${suffix ? ` ${suffix}` : ""}`;
    })
    .join("; ");

  return (
    <svg className="line-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary || `No ${metric} in this range`}>
      {[0, 0.5, 1].map((level) => {
        const y = TOP + (BOTTOM - TOP) * (1 - level);
        return <line key={level} className="line-grid" x1={LEFT} x2={RIGHT} y1={y} y2={y} />;
      })}
      <text className="line-scale" x={LEFT} y={12}>
        {metric === "feeling" ? "10" : `${metric === "minutes" ? formatDuration(max, durationUnit) : max} ${unit}`}
      </text>
      {plotted.length > 1 ? <polyline className="line-series" points={line(plotted, ratio)} /> : null}
      {metric === "feeling"
        ? plotted.map((point, index) => (
            <circle key={point.label + index} className="line-point" cx={xAt(index, plotted.length)} cy={yAt(ratio(point))} r="3" />
          ))
        : null}
      {labels.map((index) => {
        const x = xAt(index, plotted.length);
        return (
          <text key={plotted[index].label + index} className="line-label" x={x} y={154} textAnchor={anchor(index, plotted.length)}>
            {plotted[index].label}
          </text>
        );
      })}
    </svg>
  );
}

function line(points: ActivityPoint[], ratio: (point: ActivityPoint) => number): string {
  return points
    .map((point, index) => `${xAt(index, points.length).toFixed(1)},${yAt(ratio(point)).toFixed(1)}`)
    .join(" ");
}

function yAt(ratio: number): number {
  return BOTTOM - ratio * (BOTTOM - TOP);
}

function xAt(index: number, count: number): number {
  if (count <= 1) return (LEFT + RIGHT) / 2;
  return LEFT + ((RIGHT - LEFT) * index) / (count - 1);
}

function anchor(index: number, count: number): "start" | "middle" | "end" {
  if (index === 0) return "start";
  if (index === count - 1) return "end";
  return "middle";
}

function labelIndexes(count: number, alternate: boolean): number[] {
  if (alternate || count === 12) {
    const indexes: number[] = [];
    for (let index = 0; index < count; index += 2) indexes.push(index);
    return indexes;
  }
  if (count <= 12) return Array.from({ length: count }, (_, index) => index);
  const step = Math.ceil((count - 1) / 5);
  const indexes: number[] = [];
  for (let index = 0; index < count; index += step) indexes.push(index);
  const last = count - 1;
  if (indexes[indexes.length - 1] !== last) {
    if (last - indexes[indexes.length - 1] <= 1) indexes[indexes.length - 1] = last;
    else indexes.push(last);
  }
  return indexes;
}
