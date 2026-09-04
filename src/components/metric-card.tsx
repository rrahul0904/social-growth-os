import type { DashboardMetric } from "@/lib/types";

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <article className="metric-card">
      <span className="metric-label">{metric.label}</span>
      <div className="metric-row">
        <strong>{metric.value}</strong>
        <span className={metric.direction === "down" ? "metric-change down" : "metric-change"}>{metric.change}</span>
      </div>
      <span className="metric-helper">{metric.helper}</span>
    </article>
  );
}
