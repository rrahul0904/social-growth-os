export type WorkspaceRole = "owner" | "admin" | "editor" | "analyst" | "viewer" | string;

export function canEditContent(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canReadAnalytics(role: WorkspaceRole): boolean {
  return ["owner", "admin", "editor", "analyst", "viewer"].includes(role);
}
