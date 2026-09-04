import assert from "node:assert/strict";
import test from "node:test";
import { workflows } from "../src/lib/demo-data";
import { executeWorkflow } from "../src/lib/workflows/engine";

test("workflow stops at approval boundary", async () => {
  const result = await executeWorkflow(workflows[0], { productId: "p1", initiatedBy: "test", approved: false });
  assert.equal(result.status, "waiting_approval");
  assert.equal(result.stepResults.at(-1)?.status, "waiting");
});

test("approved workflow executes all steps", async () => {
  const result = await executeWorkflow(workflows[0], { productId: "p1", initiatedBy: "test", approved: true });
  assert.equal(result.status, "completed");
  assert.equal(result.stepResults.length, workflows[0].steps.length);
});
