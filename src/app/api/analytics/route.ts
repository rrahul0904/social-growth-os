import { analyticsSnapshot } from "@/lib/demo-data";

export async function GET() {
  return Response.json(analyticsSnapshot);
}
