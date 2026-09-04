import { AppShell } from "@/components/app-shell";
import { requireRequestContext } from "@/lib/auth/context";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const context = await requireRequestContext();
  return <AppShell workspaceName={context.workspaceName} role={context.role} userLabel={context.email ?? context.userId} demo={context.demo}>{children}</AppShell>;
}
