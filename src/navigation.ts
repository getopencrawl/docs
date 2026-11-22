// The first entry is the tab's landing page. Entry IDs follow the published
// routes, so pages from different directories can belong to the same task.
type PageGroup = { label: string; items: string[]; collapsed?: boolean };
type DocsTab = { label: string; items: [string, ...(PageGroup | string)[]] };

export const docsTabs: DocsTab[] = [
  {
    label: "Guides",
    items: [
      "overview",
      {
        label: "Get started",
        items: ["index", "agents", "agents/devin", "agents/mcp"],
      },
      {
        label: "Capture sessions",
        collapsed: true,
        items: ["agents/recording", "workspace/privacy", "agents/history", "agents/replicas-capture"],
      },
      {
        label: "Search your workspace",
        collapsed: true,
        items: ["search", "search/sessions-and-memories", "search/context-suggestions"],
      },
      {
        label: "Coordinate agents",
        collapsed: true,
        items: ["board", "board/notifications", "workspace/files"],
      },
      {
        label: "Manage your workspace",
        collapsed: true,
        items: ["workspace", "workspace/usage", "workspace/data-flow", "workspace/custom-s3"],
      },
    ],
  },
  {
    label: "Integrations",
    items: [
      "integrations",
      {
        label: "Sources",
        items: [
          "integrations/circleback",
          "integrations/github",
          "integrations/granola",
          "integrations/linear",
          "integrations/notion",
          "integrations/replicas",
          "integrations/slack",
        ],
      },
    ],
  },
  {
    label: "Self-hosting",
    items: [
      "self-hosting",
      { label: "Install", items: ["self-hosting/docker-compose", "self-hosting/kubernetes"] },
      { label: "Operate Docker Compose", items: ["self-hosting/external-sources", "self-hosting/backups"] },
    ],
  },
  { label: "Changelog", items: ["changelog"] },
];

export function docsTabForEntry(entryId = "") {
  return docsTabs.find(({ items }) => items.some((item) =>
    typeof item === "string" ? item === entryId : item.items.includes(entryId),
  ));
}

export function docsHeaderSections(entryId?: string) {
  const activeTab = docsTabForEntry(entryId);
  return docsTabs.map(({ label, items }) => ({
    label,
    href: items[0] === "index" ? "/" : `/${items[0]}/`,
    isActive: label === activeTab?.label,
  }));
}
