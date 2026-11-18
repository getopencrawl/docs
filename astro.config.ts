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
  sidebar: { items: ["index", { autogenerate: { collection: "docs" } }] },
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
