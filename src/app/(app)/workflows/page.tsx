import { PageHeading } from "@/components/page-heading";
import { workflows } from "@/lib/demo-data";
import { Icon } from "@/components/icons";

export default function WorkflowsPage() {
  return (
    <>
      <PageHeading eyebrow="Deterministic automation" title="Workflows that survive the chat window." description="Use agent reasoning to design work, then execute critical publishing operations through durable, replayable workflow steps." action={<button className="primary-button"><Icon name="flow" width={16} height={16}/> New workflow</button>} />
      <section className="workflow-card-grid">
        {workflows.map((workflow) => (
          <article className="panel workflow-card" key={workflow.id}>
            <div className="workflow-card-top"><div className="workflow-symbol"><Icon name="flow" width={20} height={20}/></div><span className={workflow.enabled ? "toggle on" : "toggle"}><span/></span></div>
            <h2>{workflow.name}</h2><p>{workflow.description}</p>
            <div className="trigger-row"><span>Trigger</span><code>{workflow.trigger}</code></div>
            <div className="step-lane">{workflow.steps.map((step, index) => <div className="step-node" key={step.id}><span>{index + 1}</span><strong>{step.label}</strong>{index < workflow.steps.length - 1 ? <i/> : null}</div>)}</div>
            <div className="workflow-card-footer"><span>{workflow.runCount} total runs</span><button className="secondary-button">Run test</button></div>
          </article>
        ))}
      </section>
    </>
  );
}
