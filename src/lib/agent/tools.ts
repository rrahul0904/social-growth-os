import type { AgentToolTrace, Product } from "../types";
import { findProducts, getBrandContext, getWorkspaceSnapshot } from "../repositories/workspace";

async function traced<T>(tool:string,fn:()=>Promise<T>|T,summarize:(value:T)=>string):Promise<{value:T;trace:AgentToolTrace}>{const start=Date.now();try{const value=await fn();return{value,trace:{tool,status:"completed",summary:summarize(value),durationMs:Date.now()-start}}}catch(error){return{value:undefined as T,trace:{tool,status:"failed",summary:error instanceof Error?error.message:"Tool failed",durationMs:Date.now()-start}}}}

export async function lookupProducts(workspaceId:string,query:string){return traced("catalog.search",()=>findProducts(workspaceId,query),(value:Product[])=>`Loaded ${value.length} product records from normalized commerce catalog`)}
export async function loadBrandContext(workspaceId:string){return traced("brand.context",()=>getBrandContext(workspaceId),()=>"Loaded brand voice, audience, guardrails and historical winning themes")}
export async function loadPerformance(workspaceId:string){return traced("analytics.read",async()=>{const snapshot=await getWorkspaceSnapshot(workspaceId);return{snapshot:snapshot.analytics,topPost:snapshot.posts.find(post=>post.status==="published")}},value=>`Loaded current funnel performance: ${value.snapshot.clicks.toLocaleString()} qualified clicks`)}
export async function loadCalendar(workspaceId:string){return traced("calendar.read",async()=>{const snapshot=await getWorkspaceSnapshot(workspaceId);return snapshot.posts.filter(post=>post.status==="scheduled"||post.status==="approval")},value=>`Loaded ${value.length} scheduled or approval-pending posts`)}
