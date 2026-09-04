import { createHmac, timingSafeEqual } from "node:crypto";
import type { Product } from "../types";

export function verifyHmac(body: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function normalizeShopifyProduct(payload: Record<string, unknown>): Product {
  const variants = Array.isArray(payload.variants) ? (payload.variants as Array<Record<string, unknown>>) : [];
  const firstVariant = variants[0] ?? {};
  return {
    id: `shopify_${String(payload.id ?? crypto.randomUUID())}`,
    externalId: String(payload.id ?? ""),
    source: "shopify",
    title: String(payload.title ?? "Untitled product"),
    description: String(payload.body_html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
    price: Number(firstVariant.price ?? 0),
    currency: "USD",
    tags: String(payload.tags ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    inventory: variants.reduce((sum, variant) => sum + Number(variant.inventory_quantity ?? 0), 0),
    updatedAt: String(payload.updated_at ?? new Date().toISOString()),
  };
}

export function normalizeWooCommerceProduct(payload: Record<string, unknown>): Product {
  const tags = Array.isArray(payload.tags) ? (payload.tags as Array<Record<string, unknown>>) : [];
  return {
    id: `woocommerce_${String(payload.id ?? crypto.randomUUID())}`,
    externalId: String(payload.id ?? ""),
    source: "woocommerce",
    title: String(payload.name ?? "Untitled product"),
    description: String(payload.short_description ?? payload.description ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    price: Number(payload.price ?? 0),
    currency: String(payload.currency ?? "USD"),
    tags: tags.map((tag) => String(tag.name ?? "")).filter(Boolean),
    inventory: Number(payload.stock_quantity ?? 0),
    updatedAt: String(payload.date_modified_gmt ?? payload.date_modified ?? new Date().toISOString()),
  };
}
