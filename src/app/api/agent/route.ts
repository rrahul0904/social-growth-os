import { runGrowthAgent } from "@/lib/agent/orchestrator";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string };
    if (!body.message?.trim()) return Response.json({ error: "message is required" }, { status: 400 });
    const result = await runGrowthAgent(body.message.trim());
    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to build campaign plan" }, { status: 500 });
  }
}
