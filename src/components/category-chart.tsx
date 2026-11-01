import { CATEGORIES, type Category } from "@/lib/types";
import type { CategoryTotals } from "@/lib/stats";

export function CategoryChart({ totals }: { totals: CategoryTotals }) {
  const peak = Math.max(...CATEGORIES.map((category) => totals[category]), 1);
  return (
    <div className="chart">
      {CATEGORIES.map((category) => (
        <div key={category}>
          <div className="bar-label">
            <span>{category}</span>
            <strong>{totals[category]} min</strong>
          </div>
          <div className="bar-track">
            <span className="bar-fill" style={{ width: `${(totals[category] / peak) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function categoryLabel(categories: Category[]): string {
  return categories.join(", ");
}
