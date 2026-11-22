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

test("the overview sends agent work to one index that links every agent guide", () => {
  const tab = docsTabs.find(({ label }) => label === "For agents");
  assert.ok(tab);
  const [index, ...groups] = tab.items;
  const pages = groups.flatMap((item) => typeof item === "string" ? [item] : item.items);
  assert.ok(pages.includes("board"));

  const overview = readFileSync(new URL("../dist/overview/index.md", import.meta.url), "utf8");
  const agentIndex = readFileSync(new URL(`../dist/${index}/index.md`, import.meta.url), "utf8");
  function linksTo(markdown, id) {
    return Array.from(markdown.matchAll(/\]\((https?:\/\/[^)]+)\)/g)).some(([, href]) =>
      new URL(href).pathname === `/${id}/`,
    );
  }
  assert.ok(linksTo(overview, index));
  for (const page of pages) {
    assert.ok(linksTo(agentIndex, page), `Missing agent guide: ${page}`);
    assert.ok(!linksTo(overview, page), `Agent guide in the human overview: ${page}`);
  }
});
