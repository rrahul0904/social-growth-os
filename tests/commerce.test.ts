import assert from "node:assert/strict";
import test from "node:test";
import { normalizeShopifyProduct, normalizeWooCommerceProduct, verifyHmac } from "../src/lib/adapters/commerce";
import { createHmac } from "node:crypto";

test("normalizes a Shopify product into the shared catalog schema", () => {
  const result = normalizeShopifyProduct({
    id: 42,
    title: "Linen Shirt",
    body_html: "<p>Soft linen</p>",
    tags: "summer, linen",
    variants: [{ price: "59.00", inventory_quantity: 5 }, { price: "59.00", inventory_quantity: 3 }],
    updated_at: "2026-09-03T00:00:00Z",
  });
  assert.equal(result.source, "shopify");
  assert.equal(result.price, 59);
  assert.equal(result.inventory, 8);
  assert.deepEqual(result.tags, ["summer", "linen"]);
});

test("normalizes a WooCommerce product into the shared catalog schema", () => {
  const result = normalizeWooCommerceProduct({ id: 7, name: "Weekender", short_description: "<b>Carry-on</b>", price: "119", stock_quantity: 9, tags: [{ name: "travel" }] });
  assert.equal(result.source, "woocommerce");
  assert.equal(result.title, "Weekender");
  assert.equal(result.description, "Carry-on");
});

test("webhook HMAC verification uses constant-time comparison", () => {
  const body = JSON.stringify({ id: 1 });
  const secret = "secret";
  const signature = createHmac("sha256", secret).update(body).digest("base64");
  assert.equal(verifyHmac(body, signature, secret), true);
  assert.equal(verifyHmac(body, "bad", secret), false);
});
