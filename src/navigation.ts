// The first entry is the tab's landing page. Entry IDs follow the published
// routes, so pages from different directories can belong to the same task.
type PageGroup = { label: string; items: string[]; collapsed?: boolean };
type DocsTab = { label: string; items: [string, ...(PageGroup | string)[]] };

export const docsTabs: DocsTab[] = [
  {
    label: "Main",
    items: [
      "overview",
      {
        label: "Get started",
        items: ["index", "agents", "agents/devin", "agents/mcp"],
      },
      {
        label: "How OpenCrawl works",
        items: ["search/sessions-and-memories", "workspace/agent-handoffs", "workspace/data-flow"],
      },
      {
        label: "Capture and context settings",
        collapsed: true,
        items: ["agents/recording", "agents/history", "agents/replicas-capture", "workspace/privacy", "search/context-suggestions"],
      },
      {
        label: "Manage your workspace",
        collapsed: true,
        items: ["workspace", "workspace/custom-s3", "workspace/usage"],
      },
      {
        label: "For agents",
        collapsed: true,
        items: ["for-agents", "search", "board", "board/notifications", "workspace/files"],
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
  { label: "Self-hosting", items: ["self-hosting", "self-hosting/claude-code-service"] },
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
