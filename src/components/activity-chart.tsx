import type { ActivityPoint } from "@/lib/stats";

const WIDTH = 320;
const HEIGHT = 168;
const LEFT = 8;
const RIGHT = 312;
const TOP = 16;
const BOTTOM = 132;

export function ActivityChart({ points, metric }: { points: ActivityPoint[]; metric: "sessions" | "minutes" }) {
  const value = (point: ActivityPoint) => (metric === "sessions" ? point.sessions : point.minutes);
  const max = Math.max(...points.map(value), 1);
  const unit = metric === "sessions" ? (max === 1 ? "session" : "sessions") : "min";
  const labels = labelIndexes(points.length);
  const summary = points
    .filter((point) => value(point) > 0)
    .map((point) => `${point.label}: ${value(point)} ${metric === "sessions" ? "sessions" : "min"}`)
    .join("; ");

  return (
    <svg className="line-chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary || `No ${metric} in this range`}>
      {[0, 0.5, 1].map((level) => {
        const y = TOP + (BOTTOM - TOP) * (1 - level);
        return <line key={level} className="line-grid" x1={LEFT} x2={RIGHT} y1={y} y2={y} />;
      })}
      <text className="line-scale" x={LEFT} y={12}>{max} {unit}</text>
      <polyline className="line-series" points={path(points, (point) => value(point) / max)} />
      {labels.map((index) => {
        const x = xAt(index, points.length);
        return (
          <text key={points[index].label + index} className="line-label" x={x} y={154} textAnchor={anchor(index, points.length)}>
            {points[index].label}
          </text>
        );
      })}
    </svg>
  );
}

function path(points: ActivityPoint[], ratio: (point: ActivityPoint) => number): string {
  return points
    .map((point, index) => {
      const x = xAt(index, points.length);
      const y = BOTTOM - ratio(point) * (BOTTOM - TOP);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
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

function labelIndexes(count: number): number[] {
  if (count === 12) return [0, 2, 4, 6, 8, 10];
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
