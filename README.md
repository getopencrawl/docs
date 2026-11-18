# OpenCrawl docs

Public product documentation for OpenCrawl, at https://docs.getopencrawl.com.
Built with [Astro Starlight](https://starlight.astro.build/) and hosted as static assets on Cloudflare Workers.

## Edit

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`.
The only content page is `src/content/docs/index.md`. Add future guides as Markdown files in that directory and include them in the sidebar in `astro.config.mjs`.

The logo, lavender palette, Funnel Display headings, Switzer body text, and Geist wordmark match https://getopencrawl.com. Fonts load from the existing brand domain.

## Validate and deploy

`npm run build` validates and builds the docs. GitHub Actions runs the same build for pushes and pull requests.

After signing into the OnePatch Cloudflare account with `npx wrangler login`, run `npm run deploy`. The dedicated `opencrawl-docs` Worker serves only `docs.getopencrawl.com`; Wrangler manages its custom domain and TLS. Publishing currently uses this command, not an automatic deployment on Git push.

For rollback, use `npx wrangler rollback <version-id>` and revert the corresponding source commit before the next deployment. View versions with `npx wrangler versions list`.

## Repository boundary

Keep public user guides for both self-hosted OpenCrawl and OpenCrawl Cloud here, independently deployable from either application. Keep contributor and implementation documentation beside the owning code in `opencrawl-core` or the hosted shell. Generated API references can be imported from core later.
