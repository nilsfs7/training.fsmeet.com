import { CATEGORIES, type Category, type DurationUnit } from '@/lib/types';
import { durationSuffix, formatDuration, type CategoryTotals } from '@/lib/stats';

const CX = 160;
const CY = 152;
const RADIUS = 74;
const LABEL_RADIUS = 102;

function angle(index: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / CATEGORIES.length;
}

function at(index: number, ratio: number, radius = RADIUS): { x: number; y: number } {
  const theta = angle(index);
  return {
    x: CX + Math.cos(theta) * radius * ratio,
    y: CY + Math.sin(theta) * radius * ratio,
  };
}

function points(ratio: number): string {
  return CATEGORIES.map((_, index) => {
    const point = at(index, ratio);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(' ');
}

export function CategoryChart({ totals, unit = "minutes" }: { totals: CategoryTotals; unit?: DurationUnit }) {
  const peak = Math.max(...CATEGORIES.map(category => totals[category]), 1);
  const shape = CATEGORIES.map((category, index) => {
    const point = at(index, totals[category] / peak);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(' ');
  const suffix = durationSuffix(unit);
  const summary = CATEGORIES.map(category => `${category} ${formatDuration(totals[category], unit)} ${suffix}`).join(', ');

  return (
    <svg className="radar" viewBox="-28 -6 376 324" role="img" aria-label={summary}>
      {[0.25, 0.5, 0.75, 1].map(level => (
        <polygon key={level} className="radar-grid" points={points(level)} />
      ))}
      {CATEGORIES.map((category, index) => {
        const end = at(index, 1);
        return <line key={category} className="radar-axis" x1={CX} y1={CY} x2={end.x} y2={end.y} />;
      })}
      <polygon className="radar-shape" points={shape} />
      {CATEGORIES.map((category, index) => {
        const point = at(index, 1, LABEL_RADIUS);
        const anchor = Math.abs(point.x - CX) < 12 ? 'middle' : point.x > CX ? 'start' : 'end';
        const dy = point.y < CY - 8 ? -6 : point.y > CY + 8 ? 14 : 4;
        return (
          <text key={category} className="radar-label" x={point.x} y={point.y} textAnchor={anchor}>
            <tspan x={point.x} dy={dy}>
              {category}
            </tspan>
            <tspan className="radar-value" x={point.x} dy="15">
              {formatDuration(totals[category], unit)} {suffix}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function categoryLabel(categories: Category[]): string {
  return categories.join(', ');
}
