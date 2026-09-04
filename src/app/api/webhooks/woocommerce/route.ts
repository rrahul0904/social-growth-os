import { normalizeWooCommerceProduct, verifyHmac } from "@/lib/adapters/commerce";
import { resolveConnectionWorkspace } from "@/lib/repositories/workspace";
import { enqueueJob } from "@/lib/queue/jobs";
import { isDemoMode } from "@/lib/config";

export async function POST(request:Request){const raw=await request.text();const secret=process.env.WOOCOMMERCE_WEBHOOK_SECRET??"";const signature=request.headers.get("x-wc-webhook-signature");if(!isDemoMode()&&!verifyHmac(raw,signature,secret))return Response.json({error:"invalid signature"},{status:401});const source=request.headers.get("x-wc-webhook-source")??"demo-store";const workspaceId=await resolveConnectionWorkspace("woocommerce",source);if(!workspaceId)return Response.json({error:"unknown commerce connection"},{status:404});const product=normalizeWooCommerceProduct(JSON.parse(raw) as Record<string,unknown>);const job=await enqueueJob("catalog.sync",{source:"woocommerce",externalAccountId:source,product},workspaceId);return Response.json({accepted:true,productId:product.id,jobId:job.id},{status:202})}
