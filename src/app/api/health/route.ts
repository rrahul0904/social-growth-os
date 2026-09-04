import { isDemoMode } from "@/lib/config";

export async function GET() {
  return Response.json({ status: "ok", service: "social-growth-os", demoMode: isDemoMode(), timestamp: new Date().toISOString() });
}
