import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWorkspaceSlug } from "../src/lib/auth/workspace-slug";

test("workspace slug is deterministic and tenant-specific",()=>{assert.equal(normalizeWorkspaceSlug("abc-12345-def","Rahul.Singh@example.com"),"rahul-singh-abc12345")});
test("workspace slug handles missing email safely",()=>{assert.equal(normalizeWorkspaceSlug("user-998877",null),"workspace-user9988")});
