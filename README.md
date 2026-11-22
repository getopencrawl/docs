# OpenCrawl docs

Public product documentation at https://docs.getopencrawl.com, built with [Nimbus](https://nimbus-docs.com) and hosted as static assets on Cloudflare Workers.

## Edit

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`.
Add MDX pages under `src/content/docs/` and place each page's entry ID in `src/navigation.ts`. This sets the tabs, sidebar groups, and reading order independently of the page URLs.

File a guide by who performs the task. Put agent-operated workflows in **For agents** and link them from `src/content/docs/for-agents.mdx`. Keep installation, consent, and console tasks in the human-facing sections and link them from `src/content/docs/overview.mdx`.

The logo, lavender palette, Funnel Display headings, Switzer body text, and Geist wordmark match https://getopencrawl.com. Brand overrides live in `src/styles/brand.css`; font files load from the brand domain. The surrounding layouts and components come from the official Nimbus empty starter, recorded in `nimbus.json`.

## Agent access

Nimbus generates these from the same source content during every build:

- `/index.md`: the Getting started page as clean Markdown.
- `/index.mdx`: the authored page source.
- `/llms.txt`: the documentation index.
- `/llms-full.txt`: all published documentation in one text file.
- `/.well-known/ard.json` and `/.well-known/ai-catalog.json`: agent discovery manifests.

The HTML advertises Markdown and the index; Nimbus generates Cloudflare `_headers` for discovery links and content types. The page also includes Nimbus's Copy page and View as Markdown controls. Static hosting uses explicit Markdown URLs; it does not provide an MCP server or `Accept: text/markdown` negotiation.

Cloudflare configuration rule `Public docs agent access` disables Browser Integrity Check only for GET/HEAD requests to `docs.getopencrawl.com`. It prevents error 1010 for ordinary agent HTTP clients. Other hosts and methods retain their existing settings. Keep this rule when migrating hosts or accounts.

## Validate and deploy

Run `npm run typecheck`, `npm run build`, and `npm run check`. GitHub Actions runs these checks for pushes and pull requests.

After signing into the OnePatch Cloudflare account with `npx wrangler login`, run `npm run deploy`. The dedicated `opencrawl-docs` Worker serves only `docs.getopencrawl.com`; Wrangler manages its custom domain and TLS. Publishing currently uses this command, not automatic deployment on Git push.

Verify the live page, Markdown, indexes, discovery manifests, and 404 handling after publishing. Include a request with a normal library user agent such as Python urllib, not just a browser. Confirm `/index.md` responds with `Content-Type: text/markdown`.

For rollback, use `npx wrangler rollback <version-id>` and revert the corresponding source commit before the next deployment. View versions with `npx wrangler versions list`.

## Repository boundary

Keep public user guides for both self-hosted OpenCrawl and OpenCrawl Cloud here, independently deployable from either application. Keep contributor and implementation documentation beside the owning code in `opencrawl-core` or the hosted shell. Generated API references can be imported from core later.
