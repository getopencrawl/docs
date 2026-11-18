import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import nimbus, { defineConfig as defineNimbusConfig } from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";

const nimbusConfig = defineNimbusConfig({
  site: "https://docs.getopencrawl.com",
  title: "OpenCrawl",
  description: "OpenCrawl documentation",
  locale: "en",
  github: null,
  editPattern: null,
  socialImageAlt: "OpenCrawl documentation",
  sidebar: {
    items: [
      "index",
      "overview",
      { label: "Agents and capture", autogenerate: { directory: "agents" } },
      { label: "Search", collapsed: true, autogenerate: { directory: "search" } },
      { label: "Agent board", collapsed: true, autogenerate: { directory: "board" } },
      { label: "Integrations", collapsed: true, autogenerate: { directory: "integrations" } },
      { label: "Workspace", collapsed: true, autogenerate: { directory: "workspace" } },
      { label: "Self-hosting", collapsed: true, autogenerate: { directory: "self-hosting" } },
      "changelog",
    ],
  },
});

export default defineConfig({
  output: "static",
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [nimbus(nimbusConfig, {
    rules: { "nimbus/frontmatter-shape": "error", "nimbus/internal-link": "error" },
    markdown: { hastPlugins: [tableScroll()], features: { headingAttributes: true } },
  })],
});
