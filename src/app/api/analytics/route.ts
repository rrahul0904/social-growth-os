import { getRequestContext } from "@/lib/auth/context";
import { getWorkspaceSnapshot } from "@/lib/repositories/workspace";
export async function GET(){const context=await getRequestContext();if(!context)return Response.json({error:"authentication required"},{status:401});const snapshot=await getWorkspaceSnapshot(context.workspaceId);return Response.json(snapshot.analytics)}
