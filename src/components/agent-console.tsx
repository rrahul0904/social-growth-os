"use client";

import { useState } from "react";
import type { AgentResponse } from "@/lib/types";
import { Icon } from "@/components/icons";

const starterPrompts = [
  "Launch a campaign for the Summer Linen Shirt and optimize for revenue.",
  "Use our best-performing themes to plan next week's content.",
  "Create a Fall Preview campaign without colliding with the current calendar.",
];

export function AgentConsole() {
  const [message, setMessage] = useState(starterPrompts[0]);
  const [result, setResult] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Agent request failed");
      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Agent request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="agent-layout">
      <section className="agent-chat panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Conversation</span>
            <h2>Growth Agent</h2>
          </div>
          <span className="guardrail-pill"><Icon name="check" width={14} height={14} /> Approval required</span>
        </div>
        <div className="agent-intro">
          <div className="agent-orb"><Icon name="spark" width={24} height={24} /></div>
          <div>
            <strong>Give me a business goal, not a prompt template.</strong>
            <p>I can inspect your catalog, brand rules, calendar and performance before proposing a campaign.</p>
          </div>
        </div>
        <div className="prompt-chips">
          {starterPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => setMessage(prompt)}>{prompt}</button>)}
        </div>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} aria-label="Agent request" />
        <div className="agent-submit-row">
          <span>Plans are generated in demo mode when no AI key is configured.</span>
          <button className="primary-button" type="button" onClick={submit} disabled={loading}>
            {loading ? "Planning…" : "Build campaign plan"}<Icon name="arrow" width={16} height={16} />
          </button>
        </div>
        {error ? <p className="error-banner">{error}</p> : null}
      </section>

      <section className="agent-output panel">
        <div className="panel-header"><div><span className="panel-kicker">Agent workspace</span><h2>Plan + evidence</h2></div></div>
        {!result ? (
          <div className="empty-output"><Icon name="bolt" width={28} height={28} /><strong>No plan yet</strong><p>Run the agent to see strategy, tool evidence and approval state.</p></div>
        ) : (
          <div className="agent-result">
            <div className="result-summary"><span className="status-chip status-approval">approval gate</span><p>{result.summary}</p></div>
            <h3>{result.plan.title}</h3>
            <p className="muted">{result.plan.thesis}</p>
            <div className="channel-plan-grid">
              {result.plan.channels.map((channel) => (
                <article key={channel.channel}><span>{channel.channel}</span><strong>{channel.angle}</strong><small>{channel.format} · {channel.cta}</small></article>
              ))}
            </div>
            <div className="tool-trace">
              <h4>Evidence trace</h4>
              {result.trace.map((trace) => (
                <div className="trace-row" key={trace.tool}><Icon name="check" width={14} height={14} /><div><strong>{trace.tool}</strong><span>{trace.summary}</span></div><small>{trace.durationMs}ms</small></div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
