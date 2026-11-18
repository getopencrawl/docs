import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.getopencrawl.com',
  integrations: [starlight({
    title: 'OpenCrawl',
    favicon: '/favicon.svg',
    sidebar: [{ label: 'Getting started', slug: '' }],
    tableOfContents: false,
    pagination: false,
    lastUpdated: false,
    pagefind: false,
    credits: false,
    customCss: ['./src/styles/brand.css'],
    components: {
      SiteTitle: './src/components/SiteTitle.astro',
      ThemeSelect: './src/components/Empty.astro',
    },
  })],
});
