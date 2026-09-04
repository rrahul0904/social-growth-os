export function normalizeWorkspaceSlug(userId: string, email: string | null): string {
  const local = (email?.split("@")[0] ?? "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "workspace";
  return `${local}-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase()}`;
}
