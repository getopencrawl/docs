import assert from "node:assert/strict";
import { open, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { cardId } from "../scripts/share/metadata.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = new URL("../dist/", import.meta.url);

test("the title and optional description independently version the card", () => {
  const basic = cardId(root, "Quickstart");
  assert.equal(basic, cardId(root, "Quickstart", ""));
  assert.notEqual(basic, cardId(root, "Setup"));
  assert.notEqual(
    basic,
    cardId(root, "Quickstart", "Connect your first agent."),
  );
});

test("each published page advertises a complete static preview", async () => {
  const sitemap = await readFile(new URL("sitemap-0.xml", dist), "utf8");
  const routes = Array.from(
    sitemap.matchAll(/<loc>([^<]+)<\/loc>/g),
    ([, url]) => new URL(url),
  );
  assert.ok(routes.length);
  for (const route of routes) {
    const html = await readFile(
      new URL("." + route.pathname + "index.html", dist),
      "utf8",
    );
    const media = (property) =>
      Array.from(
        html.matchAll(
          new RegExp(
            '<meta (?:property|name)="' + property + '" content="([^"]+)"',
            "g",
          ),
        ),
        ([, value]) => value,
      );
    const [poster, gif] = media("og:image");
    assert.equal(new URL(poster).origin, route.origin);
    assert.match(new URL(poster).pathname, /^\/share\/[a-f0-9]{24}\.webp$/);
    const base = poster.slice(0, -5);
    assert.deepEqual(media("og:image"), [poster, base + ".gif"], route.href);
    assert.deepEqual(media("og:video"), [base + ".mp4"]);
    assert.deepEqual(media("twitter:image"), [poster]);
    for (const [url, signature, offset] of [
      [poster, "WEBP", 8],
      [gif, "GIF89a", 0],
      [base + ".mp4", "ftyp", 4],
    ]) {
      const asset = new URL("." + new URL(url).pathname, dist);
      const bytes = (await stat(asset)).size;
      assert.ok(bytes > 1000 && bytes <= 25 * 1024 * 1024, url);
      const file = await open(asset);
      try {
        const { buffer } = await file.read(
          Buffer.alloc(signature.length),
          0,
          signature.length,
          offset,
        );
        assert.equal(buffer.toString("ascii"), signature, url);
      } finally {
        await file.close();
      }
    }
  }
});
