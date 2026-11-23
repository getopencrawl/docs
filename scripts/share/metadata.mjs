import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let design;
export function artworkFingerprint(root) {
  if (!design) {
    const hash = createHash("sha256");
    for (const file of [
      "package-lock.json",
      "scripts/share/ink.html",
      "scripts/share/render.mjs",
      "scripts/share/gif.mjs",
      ...[
        "brand.png",
        "funnel-display.woff2",
        "switzer-400.woff2",
        "paper.png",
        "paper.mkv",
        "lighting.idx.gz",
        "palette.json",
      ].map((name) => "art/share/" + name),
    ])
      hash.update(readFileSync(join(root, file)));
    design = hash.digest("hex");
  }
  return design;
}

export function cardId(root, title, description = "") {
  return createHash("sha256")
    .update(
      JSON.stringify([artworkFingerprint(root), title, description ?? ""]),
    )
    .digest("hex")
    .slice(0, 24);
}
