import { PageHeading } from "@/components/page-heading";
import { Icon } from "@/components/icons";

const integrations = [
  ["Shopify", "Commerce", "connected", "Products + webhooks"],
  ["WooCommerce", "Commerce", "connected", "REST + webhooks"],
  ["Instagram / Facebook", "Social", "connected", "Meta Graph API"],
  ["TikTok", "Social", "available", "Content Posting API"],
  ["Pinterest", "Social", "available", "Pins API"],
  ["LinkedIn", "Social", "available", "Posts API"],
  ["X", "Social", "available", "X API"],
  ["AI Gateway", "Intelligence", "configured", "Model routing"],
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHeading eyebrow="Integration control plane" title="Connect once. Keep provider complexity at the edge." description="Every provider is isolated behind an adapter so OAuth, token refresh, upload protocols and rate limits cannot leak into campaign logic." />
      <section className="integration-grid">{integrations.map(([name,type,status,detail]) => <article className="panel integration-card" key={name}><div className="integration-logo">{name.slice(0,2).toUpperCase()}</div><div><span>{type}</span><h2>{name}</h2><p>{detail}</p></div><div className="integration-footer"><span className={`status-chip status-${status === "connected" || status === "configured" ? "active" : "draft"}`}>{status}</span><button className="secondary-button">{status === "connected" || status === "configured" ? "Manage" : "Connect"}<Icon name="arrow" width={14} height={14}/></button></div></article>)}</section>
    </>
  );
}
