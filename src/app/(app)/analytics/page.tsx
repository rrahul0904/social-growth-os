import { PageHeading } from "@/components/page-heading";
import { BarChart } from "@/components/bar-chart";
import { requireRequestContext } from "@/lib/auth/context";
import { getWorkspaceSnapshot } from "@/lib/repositories/workspace";

export default async function AnalyticsPage() {
  const context = await requireRequestContext();
  const { analytics } = await getWorkspaceSnapshot(context.workspaceId);
  const roi = analytics.spend > 0 ? ((analytics.revenue - analytics.spend) / analytics.spend) * 100 : 0;
  const stages = [["Impressions", analytics.impressions],["Engagements", analytics.engagements],["Qualified clicks", analytics.clicks],["Conversions", analytics.conversions]] as const;
  const points = context.demo ? [1510,1980,1770,2450,2790,3140,2860].map((value,index)=>({label:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][index],value})) : [{label:"Live",value:analytics.revenue}];
  return <><PageHeading eyebrow="Closed-loop intelligence" title="Optimize for business outcomes, not vanity metrics." description="The growth layer joins content performance to clicks, conversions and revenue so the next campaign can learn from what actually worked."/><section className="analytics-top-grid"><article className="panel hero-stat"><span>Attributed revenue</span><strong>${analytics.revenue.toLocaleString()}</strong><small>{roi.toFixed(0)}% return over tracked spend</small></article><article className="panel hero-stat"><span>Followers gained</span><strong>{analytics.followersGained.toLocaleString()}</strong><small>persisted analytics events</small></article><article className="panel hero-stat"><span>Conversion rate</span><strong>{analytics.clicks ? ((analytics.conversions/analytics.clicks)*100).toFixed(2) : "0.00"}%</strong><small>from qualified social clicks</small></article></section><section className="dashboard-grid"><article className="panel"><div className="panel-header"><div><span className="panel-kicker">Revenue trend</span><h2>Influenced revenue</h2></div></div><BarChart points={points}/></article><article className="panel"><div className="panel-header"><div><span className="panel-kicker">Funnel</span><h2>Attention → revenue</h2></div></div><div className="funnel-list">{stages.map(([label,value],index)=><div key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong><div><i style={{width:`${Math.max(8,100-index*24)}%`}}/></div></div>)}</div></article></section></>;
}
