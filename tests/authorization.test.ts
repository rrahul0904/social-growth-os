import assert from "node:assert/strict";
import test from "node:test";
import { canEditContent, canReadAnalytics } from "../src/lib/auth/authorization";

test("content mutations are limited to owner/admin/editor", () => {
  assert.equal(canEditContent("owner"), true);
  assert.equal(canEditContent("admin"), true);
  assert.equal(canEditContent("editor"), true);
  assert.equal(canEditContent("analyst"), false);
  assert.equal(canEditContent("viewer"), false);
});

test("workspace roles can read analytics", () => {
  assert.equal(canReadAnalytics("analyst"), true);
  assert.equal(canReadAnalytics("viewer"), true);
  assert.equal(canReadAnalytics("unknown"), false);
});
