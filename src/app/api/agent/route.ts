import { canEditContent } from "@/lib/auth/authorization";
import { getRequestContext } from "@/lib/auth/context";
import { runGrowthAgent } from "@/lib/agent/orchestrator";

export async function POST(request:Request){try{const context=await getRequestContext();if(!context)return Response.json({error:"authentication required"},{status:401});if(!canEditContent(context.role))return Response.json({error:"insufficient workspace role"},{status:403});const body=(await request.json()) as {message?:string};if(!body.message?.trim())return Response.json({error:"message is required"},{status:400});return Response.json(await runGrowthAgent(body.message.trim(),{workspaceId:context.workspaceId,userId:context.userId}))}catch(error){console.error(error);return Response.json({error:"Unable to build campaign plan"},{status:500})}}
