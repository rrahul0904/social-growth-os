import { redirect } from "next/navigation";
import { hasSupabaseConfig, isDemoMode } from "../config";
import { createClient } from "../supabase/server";
import { ensureWorkspaceForUser } from "../repositories/workspace";

export interface RequestContext {
  userId: string;
  email: string | null;
  workspaceId: string;
  workspaceName: string;
  role: string;
  demo: boolean;
}

const demoContext: RequestContext = {
  userId: "demo-user",
  email: "demo@growthos.local",
  workspaceId: "demo-workspace",
  workspaceName: "Northstar Commerce",
  role: "owner",
  demo: true,
};

export async function getRequestContext(): Promise<RequestContext | null> {
  if (isDemoMode() || !hasSupabaseConfig()) return demoContext;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;

  const claims = data?.claims as Record<string, unknown> | undefined;
  const userId = typeof claims?.sub === "string" ? claims.sub : null;
  if (!userId) return null;
  const email = typeof claims?.email === "string" ? claims.email : null;

  const workspace = await ensureWorkspaceForUser(userId, email);
  return {
    userId,
    email,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    role: workspace.role,
    demo: false,
  };
}

export async function requireRequestContext(): Promise<RequestContext> {
  const context = await getRequestContext();
  if (!context) redirect("/login");
  return context;
}
