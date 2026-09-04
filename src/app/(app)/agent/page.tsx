import { AgentConsole } from "@/components/agent-console";
import { PageHeading } from "@/components/page-heading";

export default function AgentPage() {
  return (
    <>
      <PageHeading eyebrow="Agentic growth" title="Give the system a business objective." description="The Growth Agent gathers product, brand, calendar and performance evidence before proposing actions. Publishing stays behind an explicit approval boundary." />
      <AgentConsole />
    </>
  );
}
