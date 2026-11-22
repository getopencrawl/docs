import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { docsTabs } from "../src/navigation.ts";

test("each published docs page has exactly one place in the navigation", () => {
  const sitemap = readFileSync(new URL("../dist/sitemap-0.xml", import.meta.url), "utf8");
  const published = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), ([, url]) => new URL(url).pathname);
  const entries = docsTabs.flatMap(({ items }) =>
    items.flatMap((item) => typeof item === "string" ? [item] : item.items),
  );
  const routes = entries.map((id) => id === "index" ? "/" : `/${id}/`);
  assert.deepEqual(routes.sort(), published.sort());
});
