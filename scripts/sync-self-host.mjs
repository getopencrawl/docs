import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";

// Regenerate the published operator guides from the same stable tag as the kit.
const [checkout, tag] = process.argv.slice(2);
if (!checkout || !/^helm-v\d+\.\d+\.\d+$/.test(tag ?? "")) {
  throw new Error("Usage: node scripts/sync-self-host.mjs CORE_CHECKOUT helm-vX.Y.Z");
}
const github = "https://github.com/getopencrawl/opencrawl-core";
const docsDir = fileURLToPath(new URL("../src/content/docs/self-hosting/", import.meta.url));
const guides = [
  {
    source: "docs/self-host.md",
    slug: "operator-guide",
    title: "Self-hosting operator guide",
    description: "The complete single-host guide, from first administrator and agent enrollment to source setup, recovery, and backups.",
    image: "data-flow",
    alt: "Arrows connect chat sessions and imports to storage and a search index.",
  },
  {
    source: "deploy/helm/README.md",
    slug: "helm-operator-guide",
    title: "Kubernetes operator guide",
    description: "The complete Helm guide covering installation, external services, conformance, credentials, and removal.",
    image: "kubernetes",
    alt: "An open flight case holds three server units stacked between rack rails.",
  },
];

for (const guide of guides) {
  const upstream = execFileSync("git", ["-C", checkout, "show", tag + ":" + guide.source], {encoding: "utf8"});
  const body = upstream.replace(/^# [^\n]+\n+/, "")
    .replace(/This branch is a candidate\. /, "")
    .replace(/\]\(([^ )]+)\)/g, (match, href) => {
      if (href.startsWith("#")) return match;
      const [path, anchor] = href.split("#");
      let corePath = path;
      if (path.startsWith(github + "/blob/main/")) {
        corePath = path.slice((github + "/blob/main/").length);
      } else if (/^[a-z]+:/i.test(path)) {
        return match;
      } else {
        corePath = posix.normalize(posix.join(posix.dirname(guide.source), path));
      }
      const target = guides.find(other => other.source === corePath);
      const url = target ? "/self-hosting/" + target.slug + "/" : github + "/blob/" + tag + "/" + corePath;
      return "](" + url + (anchor ? "#" + anchor : "") + ")";
    });
  const header = [
    "---", "title: " + guide.title, "description: " + guide.description, "---", "",
    "![" + guide.alt + "](/images/docs/pixel/headers/" + guide.image + ".png)", "",
    "This guide covers [" + tag + "](" + github + "/releases/tag/" + tag + "). [Source guide at this release](" + github + "/blob/" + tag + "/" + guide.source + ").", "",
  ].join("\n");
  writeFileSync(docsDir + guide.slug + ".mdx", header + "\n" + body);
}
