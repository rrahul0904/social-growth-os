import { normalizeShopifyProduct, verifyHmac } from "@/lib/adapters/commerce";
import { resolveConnectionWorkspace } from "@/lib/repositories/workspace";
import { enqueueJob } from "@/lib/queue/jobs";
import { isDemoMode } from "@/lib/config";

export async function POST(request:Request){const raw=await request.text();const secret=process.env.SHOPIFY_WEBHOOK_SECRET??"";const signature=request.headers.get("x-shopify-hmac-sha256");if(!isDemoMode()&&!verifyHmac(raw,signature,secret))return Response.json({error:"invalid signature"},{status:401});const shopDomain=request.headers.get("x-shopify-shop-domain")??"demo-shop";const workspaceId=await resolveConnectionWorkspace("shopify",shopDomain);if(!workspaceId)return Response.json({error:"unknown commerce connection"},{status:404});const product=normalizeShopifyProduct(JSON.parse(raw) as Record<string,unknown>);const job=await enqueueJob("catalog.sync",{source:"shopify",externalAccountId:shopDomain,product},workspaceId);return Response.json({accepted:true,productId:product.id,jobId:job.id},{status:202})}
