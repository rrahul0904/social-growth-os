import type { MetricPoint } from "@/lib/types";

export function BarChart({ points }: { points: MetricPoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="bar-chart" aria-label="Revenue influenced over the last seven days">
      {points.map((point) => (
        <div className="bar-column" key={point.label}>
          <div className="bar-track"><div className="bar-fill" style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }} /></div>
          <span>{point.label}</span>
        </div>
      ))}
    </div>
  );
}
