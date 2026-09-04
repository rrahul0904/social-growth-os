import { isDemoMode } from "../config";
import { db } from "../db/client";
import { normalizeWorkspaceSlug } from "../auth/workspace-slug";

export interface WorkspaceMembership { id:string; name:string; role:string }

export async function ensureWorkspaceForUser(userId:string,email:string|null):Promise<WorkspaceMembership>{
  if(isDemoMode())return{id:"demo-workspace",name:"Northstar Commerce",role:"owner"};
  const sql=db();
  const existing=await sql<Array<{id:string;name:string;role:string}>>`select w.id::text as id,w.name,wm.role::text as role from workspace_members wm join workspaces w on w.id=wm.workspace_id where wm.user_id=${userId} order by wm.created_at asc limit 1`;
  if(existing[0])return existing[0];
  const slug=normalizeWorkspaceSlug(userId,email);
  const name=email?`${email.split("@")[0]}'s Workspace`:"My Workspace";
  const rows=await sql<Array<{id:string;name:string}>>`insert into workspaces(name,slug) values(${name},${slug}) on conflict(slug) do update set updated_at=now() returning id::text as id,name`;
  const workspace=rows[0];if(!workspace)throw new Error("Unable to provision workspace");
  await sql`insert into workspace_members(workspace_id,user_id,role) values(${workspace.id}::uuid,${userId},'owner') on conflict(workspace_id,user_id) do nothing`;
  return{...workspace,role:"owner"};
}

export async function resolveConnectionWorkspace(provider:string,externalAccountId:string):Promise<string|null>{
  if(isDemoMode())return"demo-workspace";
  const sql=db();const rows=await sql<Array<{workspace_id:string}>>`select workspace_id::text as workspace_id from connections where provider=${provider} and external_account_id=${externalAccountId} and status='connected' limit 1`;
  return rows[0]?.workspace_id??null;
}
