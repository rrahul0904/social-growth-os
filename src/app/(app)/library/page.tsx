import { PageHeading } from "@/components/page-heading";
import { requireRequestContext } from "@/lib/auth/context";
import { getWorkspaceSnapshot } from "@/lib/repositories/workspace";

export default async function LibraryPage(){const context=await requireRequestContext();const {posts}=await getWorkspaceSnapshot(context.workspaceId);return <><PageHeading eyebrow="Content library" title="Every asset keeps its business context." description="Generated and uploaded assets remain attached to the campaign, product, channel intent and downstream performance that justified them."/><section className="asset-grid">{posts.map((post,index)=><article className="asset-card panel" key={post.id}><div className={`asset-preview preview-${(index%4)+1}`}><span>{post.assetType}</span><div className="preview-copy">{post.channel.toUpperCase()}</div></div><div className="asset-meta"><strong>{post.title}</strong><span>{post.channel} · {post.status}</span></div></article>)}</section></>}
