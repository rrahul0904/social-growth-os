import { PageHeading } from "@/components/page-heading";
import {
  buildDiscoveryPlan,
  type BusinessContext,
  type CustomerSignal,
} from "@/lib/discovery/planner";

const context: BusinessContext = {
  product: "a deployment assistant for solo developers",
  audience: "solo SaaS founders shipping small web products",
  constraints: ["small team", "low budget", "no bulk outreach"],
  tried: ["generic launch posts", "broad founder targeting"],
};

const signals: CustomerSignal[] = [
  {
    id: "signal-switching",
    kind: "tool_switching",
    audience: "solo developers with a working local project",
    summary: "Builder describes friction moving from a working local project to a repeatable hosted deployment.",
    fit: 0.96,
    confidence: 0.93,
    source: {
      id: "source-reddit-1",
      channel: "Reddit",
      title: "My project works locally; what is the least painful way to deploy it?",
      url: "https://www.reddit.com/",
    },
  },
  {
    id: "signal-problem",
    kind: "problem_discussion",
    audience: "early-stage SaaS founders",
    summary: "Founder asks where to find first users and which acquisition channel to test first.",
    fit: 0.91,
    confidence: 0.9,
    source: {
      id: "source-reddit-2",
      channel: "Reddit",
      title: "Where do I find my first SaaS users?",
      url: "https://www.reddit.com/r/SideProject/",
    },
  },
  {
    id: "signal-profile",
    kind: "profile_relevance",
    audience: "indie founders",
    summary: "Public profile indicates the person builds SaaS products, but contains no explicit current problem signal.",
    fit: 0.95,
    confidence: 0.98,
    source: {
      id: "source-profile-1",
      channel: "Public profile",
      title: "Indie SaaS founder profile",
      url: "https://example.com/public-profile",
    },
  },
];

export default function DiscoveryPage() {
  const plan = buildDiscoveryPlan(context, signals);
  const experiment = plan.primaryExperiment;

  return (
    <>
      <PageHeading
        eyebrow="Customer discovery"
        title="Turn market evidence into one testable next move."
        description="Rank source-backed customer signals, keep weak profile relevance separate from real problem or intent evidence, and choose one bounded GTM experiment before drafting or publishing anything."
      />

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div><span className="panel-kicker">Business context</span><h2>{context.product}</h2></div>
            <span className="status-chip status-active">context loaded</span>
          </div>
          <div className="tool-trace">
            <div className="trace-row"><div><strong>Audience</strong><span>{context.audience}</span></div></div>
            <div className="trace-row"><div><strong>Constraints</strong><span>{context.constraints.join(" · ")}</span></div></div>
            <div className="trace-row"><div><strong>Already tried</strong><span>{context.tried.join(" · ")}</span></div></div>
          </div>
        </article>

        <article className="panel attention-panel">
          <div className="panel-header">
            <div><span className="panel-kicker">Primary experiment</span><h2>{experiment.title}</h2></div>
            <span className="status-chip status-approval">approval required</span>
          </div>
          <p className="muted">{experiment.hypothesis}</p>
          <div className="workflow-health-list">
            {experiment.deliverables.map((deliverable, index) => (
              <div key={deliverable}><span className="health-icon">{index + 1}</span><div><strong>{deliverable}</strong></div></div>
            ))}
          </div>
          <div className="insight-box"><p><strong>Observe:</strong> {experiment.successSignal}</p></div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div><span className="panel-kicker">Ranked opportunities</span><h2>Why this experiment won</h2></div>
          <span className="count-badge">{plan.rankedOpportunities.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Signal</th><th>Audience</th><th>Score</th><th>Evidence</th></tr></thead>
            <tbody>
              {plan.rankedOpportunities.map((opportunity) => (
                <tr key={opportunity.signalId}>
                  <td><strong>{opportunity.kind.replaceAll("_", " ")}</strong><small>{opportunity.reason}</small></td>
                  <td>{opportunity.audience}</td>
                  <td>{opportunity.score}</td>
                  <td><a className="text-link" href={opportunity.source.url} target="_blank" rel="noreferrer">{opportunity.source.channel}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-grid lower-grid">
        <article className="panel">
          <div className="panel-header"><div><span className="panel-kicker">Guardrail</span><h2>Evidence is not intent by default.</h2></div></div>
          <p className="muted">A relevant job title or founder profile can help with ICP fit, but it must not be promoted into buying intent. Stronger source classes outrank generic relevance in the deterministic planner.</p>
        </article>
        <article className="panel">
          <div className="panel-header"><div><span className="panel-kicker">Learning loop</span><h2>One experiment, then update the plan.</h2></div></div>
          <p className="muted">The next phase will persist outcomes and feed completion, friction, repeat use, and approved channel results back into the following discovery cycle.</p>
        </article>
      </section>
    </>
  );
}
