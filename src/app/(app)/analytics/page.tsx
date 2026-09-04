import { PageHeading } from "@/components/page-heading";
import { analyticsSnapshot, revenueTrend } from "@/lib/demo-data";
import { BarChart } from "@/components/bar-chart";

export default function AnalyticsPage() {
  const roi = ((analyticsSnapshot.revenue - analyticsSnapshot.spend) / analyticsSnapshot.spend) * 100;
  const stages = [
    ["Impressions", analyticsSnapshot.impressions],
    ["Engagements", analyticsSnapshot.engagements],
    ["Qualified clicks", analyticsSnapshot.clicks],
    ["Conversions", analyticsSnapshot.conversions],
  ] as const;
  return (
    <>
      <PageHeading eyebrow="Closed-loop intelligence" title="Optimize for business outcomes, not vanity metrics." description="The growth layer joins content performance to clicks, conversions and revenue so the next campaign can learn from what actually worked." />
      <section className="analytics-top-grid"><article className="panel hero-stat"><span>Attributed revenue</span><strong>${analyticsSnapshot.revenue.toLocaleString()}</strong><small>{roi.toFixed(0)}% return over tracked spend</small></article><article className="panel hero-stat"><span>Followers gained</span><strong>{analyticsSnapshot.followersGained.toLocaleString()}</strong><small>+23% vs previous period</small></article><article className="panel hero-stat"><span>Conversion rate</span><strong>{((analyticsSnapshot.conversions / analyticsSnapshot.clicks) * 100).toFixed(2)}%</strong><small>from qualified social clicks</small></article></section>
      <section className="dashboard-grid"><article className="panel"><div className="panel-header"><div><span className="panel-kicker">Revenue trend</span><h2>Influenced revenue</h2></div></div><BarChart points={revenueTrend}/></article><article className="panel"><div className="panel-header"><div><span className="panel-kicker">Funnel</span><h2>Attention → revenue</h2></div></div><div className="funnel-list">{stages.map(([label,value], index) => <div key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong><div><i style={{width: `${Math.max(8, 100 - index * 24)}%`}}/></div></div>)}</div></article></section>
    </>
  );
}
