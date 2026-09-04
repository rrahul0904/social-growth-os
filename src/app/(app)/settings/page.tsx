import { PageHeading } from "@/components/page-heading";

export default function SettingsPage() {
  return (
    <>
      <PageHeading eyebrow="Governance" title="Autonomy should be configurable, not implied." description="Set workspace-wide approval, spend, publishing and AI-use policies before giving agents more control." />
      <section className="settings-grid">
        <article className="panel settings-card"><h2>Publishing policy</h2><div className="setting-row"><div><strong>Require human approval</strong><span>Before any content reaches an external social network.</span></div><span className="toggle on"><span/></span></div><div className="setting-row"><div><strong>Allow scheduled publishing</strong><span>Workers may publish previously approved posts at their scheduled time.</span></div><span className="toggle on"><span/></span></div></article>
        <article className="panel settings-card"><h2>Agent guardrails</h2><div className="setting-row"><div><strong>Use only catalog facts</strong><span>Product claims must be grounded in connected commerce data.</span></div><span className="toggle on"><span/></span></div><div className="setting-row"><div><strong>External web research</strong><span>Require a separate approval before enabling open-web tools.</span></div><span className="toggle"><span/></span></div></article>
      </section>
    </>
  );
}
