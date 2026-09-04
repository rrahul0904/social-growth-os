import type { WorkflowDefinition, WorkflowRunResult, WorkflowStep } from "../types";

export interface WorkflowContext {
  productId?: string;
  campaignId?: string;
  initiatedBy: string;
  approved?: boolean;
}

type StepHandler = (
  step: WorkflowStep,
  context: WorkflowContext,
) => Promise<{ status: "completed" | "waiting"; output?: Record<string, unknown> }>;

const handlers: Record<WorkflowStep["type"], StepHandler> = {
  load_brand_context: async () => ({ status: "completed", output: { brandContextLoaded: true } }),
  load_product: async (_step, context) => ({
    status: "completed",
    output: { productId: context.productId ?? "demo-product" },
  }),
  generate_copy: async () => ({ status: "completed", output: { variantsGenerated: 4 } }),
  generate_image_prompt: async () => ({ status: "completed", output: { creativeBriefGenerated: true } }),
  request_approval: async (_step, context) =>
    context.approved
      ? { status: "completed", output: { approved: true } }
      : { status: "waiting", output: { approvalRequired: true } },
  schedule_post: async () => ({ status: "completed", output: { scheduled: true } }),
  publish_post: async () => ({ status: "completed", output: { published: true } }),
  measure_results: async () => ({ status: "completed", output: { analyticsJobQueued: true } }),
};

export async function executeWorkflow(
  workflow: WorkflowDefinition,
  context: WorkflowContext,
): Promise<WorkflowRunResult> {
  const startedAt = new Date().toISOString();
  const runId = `run_${crypto.randomUUID()}`;
  const stepResults: WorkflowRunResult["stepResults"] = [];

  for (const step of workflow.steps) {
    try {
      const result = await handlers[step.type](step, context);
      stepResults.push({ stepId: step.id, status: result.status, output: result.output });
      if (result.status === "waiting") {
        return { workflowId: workflow.id, runId, status: "waiting_approval", startedAt, stepResults };
      }
    } catch (error) {
      stepResults.push({
        stepId: step.id,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown step failure",
      });
      return {
        workflowId: workflow.id,
        runId,
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        stepResults,
      };
    }
  }

  return {
    workflowId: workflow.id,
    runId,
    status: "completed",
    startedAt,
    finishedAt: new Date().toISOString(),
    stepResults,
  };
}
