# OpenCrawl docs

Public product documentation at https://docs.getopencrawl.com, built with [Nimbus](https://nimbus-docs.com) and hosted as static assets on Cloudflare Workers.

## Edit

Use Node.js 24 and npm. Run `npm ci`, then `npm run dev`.
Add MDX pages under `src/content/docs/` and place each page's entry ID in `src/navigation.ts`. This sets the tabs, sidebar groups, and reading order independently of the page URLs.

Use **Main** to explain how features work together, what people can see, and which settings they control. Group agent-operated procedures under **Main → For agents** and link them from `src/content/docs/for-agents.mdx`. The Main overview in `src/content/docs/overview.mdx` points to that index. Provider setup, operator instructions, and release history belong in **Integrations**, **Self-hosting**, and **Changelog** respectively.

The logo, lavender palette, Funnel Display headings, Switzer body text, and Geist wordmark match https://getopencrawl.com. Brand overrides live in `src/styles/brand.css`; font files load from the brand domain. The surrounding layouts and components come from the official Nimbus empty starter, recorded in `nimbus.json`.

### Documentation illustrations

Use square pixels and four flat colors. Choose a subject that explains the page. A conversation can be drawn as messages, and boxes and arrows can show where data goes. Use periwinkle `#7D82FF` for the background, dark ink `#24223A` for outlines, lavender `#BABCFF` for shading, and near-white `#F5F4FF` for highlights.

Add a header when a page has more than four prose paragraphs. Count quoted prose and skip headings, lists, tables, code, and image-only blocks.

Draw on a 222 × 82 grid and export at 4× with nearest-neighbor scaling. Put the PNG under `public/images/docs/pixel/headers/` and include it as the first block in the page body. Use short alt text describing the subject. The same image and description appear in the Markdown edition.

Light physical objects from the upper left. Keep the top and left edges bright and shade the undersides and right faces. Start a cast shadow where the object meets the surface and project it a short distance down and right. Keep diagrams flat. Show motion when it explains the action, as with the envelope passing between two hands.

Edit the [native-size pixel sheet](art/headers/master.png) with a one-pixel pencil. The rows in `art/headers/export.mjs` map each tile to a page. Run `node art/headers/export.mjs` to regenerate the published PNGs.

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

Merge a pull request into `main` to publish. Cloudflare Workers Builds checks the site and deploys it to `docs.getopencrawl.com` through the `opencrawl-docs` Worker. To see which commit is live or diagnose a failed build, open the Worker’s **Deployments** and **Builds** in Cloudflare.

Verify the live page, Markdown, indexes, discovery manifests, and 404 handling after publishing. Include a request with a normal library user agent such as Python urllib, not just a browser. Confirm `/index.md` responds with `Content-Type: text/markdown`.

For rollback, use `npx wrangler rollback <version-id>` and revert the corresponding source commit before the next deployment. View versions with `npx wrangler versions list`.

## Repository boundary

Keep public user guides for both self-hosted OpenCrawl and OpenCrawl Cloud here, independently deployable from either application. Keep contributor and implementation documentation beside the owning code in `opencrawl-core` or the hosted shell. Generated API references can be imported from core later.
