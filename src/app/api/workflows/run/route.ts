import { workflows } from "@/lib/demo-data";
import { executeWorkflow } from "@/lib/workflows/engine";

export async function POST(request: Request) {
  const body = (await request.json()) as { workflowId?: string; productId?: string; approved?: boolean };
  const workflow = workflows.find((item) => item.id === body.workflowId);
  if (!workflow) return Response.json({ error: "workflow not found" }, { status: 404 });
  const result = await executeWorkflow(workflow, { productId: body.productId, initiatedBy: "api", approved: body.approved });
  return Response.json(result);
}
