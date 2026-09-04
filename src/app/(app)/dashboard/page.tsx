import Link from "next/link";
import { BarChart } from "@/components/bar-chart";
import { MetricCard } from "@/components/metric-card";
import { PageHeading } from "@/components/page-heading";
import { StatusChip } from "@/components/status-chip";
import { campaigns, dashboardMetrics, posts, revenueTrend, workflows } from "@/lib/demo-data";
import { Icon } from "@/components/icons";

export default function DashboardPage() {
  const approvals = posts.filter((post) => post.status === "approval");
  return (
    <>
      <PageHeading
        eyebrow="Command Center"
        title="Turn attention into measurable growth."
        description="One operating view for what the agents are planning, what needs approval, what is publishing and what is actually driving business outcomes."
        action={<Link href="/agent" className="primary-button"><Icon name="spark" width={16} height={16} /> Ask Growth Agent</Link>}
      />

      <section className="metric-grid">{dashboardMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>

      <section className="dashboard-grid">
        <article className="panel revenue-panel">
          <div className="panel-header"><div><span className="panel-kicker">Business impact</span><h2>Revenue influenced</h2></div><span className="big-number">$18.4k</span></div>
          <BarChart points={revenueTrend} />
        </article>
        <article className="panel attention-panel">
          <div className="panel-header"><div><span className="panel-kicker">Needs you</span><h2>Approval queue</h2></div><span className="count-badge">{approvals.length}</span></div>
          {approvals.map((post) => (
            <div className="approval-row" key={post.id}>
              <div className="channel-icon">{post.channel.slice(0, 2).toUpperCase()}</div>
              <div><strong>{post.title}</strong><span>{post.channel} · {post.assetType}</span></div>
              <Link href="/calendar" className="text-link">Review <Icon name="arrow" width={14} height={14} /></Link>
            </div>
          ))}
          <div className="insight-box"><Icon name="spark" width={18} height={18} /><p><strong>Agent insight:</strong> Utility-first hooks are producing 31% more qualified clicks than aspiration-first hooks this week.</p></div>
        </article>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel">
          <div className="panel-header"><div><span className="panel-kicker">Active campaigns</span><h2>Portfolio</h2></div><Link className="text-link" href="/calendar">Open calendar <Icon name="arrow" width={14} height={14}/></Link></div>
          <div className="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Channels</th><th>Posts</th><th>Revenue</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.name}</strong><small>{campaign.objective}</small></td><td><StatusChip status={campaign.status}/></td><td>{campaign.channels.length}</td><td>{campaign.posts}</td><td>{campaign.revenue ? `$${campaign.revenue.toLocaleString()}` : "—"}</td></tr>)}</tbody></table></div>
        </article>
        <article className="panel">
          <div className="panel-header"><div><span className="panel-kicker">Automation</span><h2>Workflow health</h2></div><Link className="text-link" href="/workflows">Manage <Icon name="arrow" width={14} height={14}/></Link></div>
          <div className="workflow-health-list">{workflows.map((workflow) => <div key={workflow.id}><span className="health-icon"><Icon name="check" width={15} height={15}/></span><div><strong>{workflow.name}</strong><small>{workflow.runCount} runs · last run healthy</small></div><span className="status-chip status-active">active</span></div>)}</div>
        </article>
      </section>
    </>
  );
}
