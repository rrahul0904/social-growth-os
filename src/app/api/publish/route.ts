import { canEditContent } from "@/lib/auth/authorization";
import { getPublisher } from "@/lib/adapters/social";
import { getRequestContext } from "@/lib/auth/context";
import { getPost, hasEntityApproval } from "@/lib/repositories/workspace";

export async function POST(request:Request){const context=await getRequestContext();if(!context)return Response.json({error:"authentication required"},{status:401});if(!canEditContent(context.role))return Response.json({error:"insufficient workspace role"},{status:403});const body=(await request.json()) as {postId?:string;approved?:boolean};if(!body.postId)return Response.json({error:"postId is required"},{status:400});const post=await getPost(context.workspaceId,body.postId);if(!post)return Response.json({error:"post not found"},{status:404});const approved=context.demo?Boolean(body.approved):await hasEntityApproval(context.workspaceId,"post",post.id);if(!approved)return Response.json({error:"persisted approval is required before publishing"},{status:409});return Response.json(await getPublisher(post.channel).publish(post))}
