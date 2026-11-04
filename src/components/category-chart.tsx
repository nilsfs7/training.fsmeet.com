import { categoryName, type DurationUnit, type UserCategory } from '@/lib/types';
import { durationSuffix, formatDuration, type CategoryTotals } from '@/lib/stats';

const CX = 160;
const CY = 152;
const RADIUS = 74;
const LABEL_RADIUS = 102;

function angle(index: number, count: number): number {
  return -Math.PI / 2 + (index * 2 * Math.PI) / count;
}

function at(index: number, count: number, ratio: number, radius = RADIUS): { x: number; y: number } {
  const theta = angle(index, count);
  return {
    x: CX + Math.cos(theta) * radius * ratio,
    y: CY + Math.sin(theta) * radius * ratio,
  };
}

function points(count: number, ratio: number): string {
  return Array.from({ length: count }, (_, index) => {
    const point = at(index, count, ratio);
    return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(' ');
}

export function CategoryChart({
  categories,
  totals,
  unit = 'minutes',
}: {
  categories: readonly UserCategory[];
  totals: CategoryTotals;
  unit?: DurationUnit;
}) {
  const count = categories.length;
  const peak = Math.max(...categories.map(category => totals[category.id] ?? 0), 1);
  const shape = categories
    .map((category, index) => {
      const point = at(index, count, (totals[category.id] ?? 0) / peak);
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(' ');
  const suffix = durationSuffix(unit);
  const summary = categories
    .map(category => `${category.label} ${formatDuration(totals[category.id] ?? 0, unit)} ${suffix}`)
    .join(', ');

  return (
    <svg className="radar" viewBox="-28 -6 376 324" role="img" aria-label={summary}>
      {[0.25, 0.5, 0.75, 1].map(level => (
        <polygon key={level} className="radar-grid" points={points(count, level)} />
      ))}
      {categories.map((category, index) => {
        const end = at(index, count, 1);
        return <line key={category.id} className="radar-axis" x1={CX} y1={CY} x2={end.x} y2={end.y} />;
      })}
      <polygon className="radar-shape" points={shape} />
      {categories.map((category, index) => {
        const point = at(index, count, 1, LABEL_RADIUS);
        const anchor = Math.abs(point.x - CX) < 12 ? 'middle' : point.x > CX ? 'start' : 'end';
        const dy = point.y < CY - 8 ? -6 : point.y > CY + 8 ? 14 : 4;
        return (
          <text key={category.id} className="radar-label" x={point.x} y={point.y} textAnchor={anchor}>
            <tspan x={point.x} dy={dy}>
              {category.label}
            </tspan>
            <tspan className="radar-value" x={point.x} dy="15">
              {formatDuration(totals[category.id] ?? 0, unit)} {suffix}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

export function categoryLabel(categories: readonly string[], taxonomy: readonly UserCategory[]): string {
  return categories.map(id => categoryName(id, taxonomy)).join(', ');
}
