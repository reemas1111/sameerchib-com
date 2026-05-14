# sameerchib.com

**Purpose:** Source of truth for the personal site at [sameerchib.com](https://sameerchib.com/) — static HTML, CSS, and JS (no bundler).

| Layer | Where |
|--------|--------|
| **Repository** | https://github.com/reemas1111/sameerchib-com (`main`) |
| **Hosting** | [Cloudflare Workers](https://developers.cloudflare.com/workers/) — Git-linked Worker **`sameerchib`** (`npx wrangler deploy`) |
| **Domain** | `sameerchib.com` (custom domain on that Worker; DNS in Cloudflare) |

Pushes to `main` trigger **Workers Builds** → `npx wrangler deploy`, which publishes static files from [`wrangler.toml`](wrangler.toml) (`[assets]` → repo root).

## Deploy map (Cloudflare Workers + Git)

1. **Cloudflare Dashboard** → **Workers & Pages** → **`sameerchib`**.
2. **Settings** → **Build** → Git repo **`reemas1111/sameerchib-com`**, production branch **`main`**.
3. **Commands** (either setup works):

   | Setting | Value |
   |---------|--------|
   | Build command | *(empty)* — **`npm ci` already runs inside `wrangler deploy`** via [`wrangler.toml`](wrangler.toml) `[build]` + [`scripts/cf-wrangler-build.sh`](scripts/cf-wrangler-build.sh) |
   | Deploy command | `npx wrangler deploy` |

   Optional: set the dashboard **Build command** to `npm ci` as well if you prefer dependencies installed before Wrangler starts (redundant but harmless).

4. After each push, check **Deployments** / build logs. If the build fails, production will not update.

5. **Custom domains**: attach **sameerchib.com** to this Worker if not already.

### `_headers` and Workers static assets

Cloudflare applies [`_headers`](_headers) from your **static assets directory** to responses — same rule format as [Pages](https://developers.cloudflare.com/workers/static-assets/headers/). The file is not served as a URL; Wrangler just uploads your other assets and the platform parses `_headers` at the edge. No dashboard “Transform Rules” copy is required unless you want extras there.

## Repo layout (what to edit)

| File / folder | Role |
|---------------|------|
| [`index.html`](index.html) | Page structure, copy, meta (SEO, Open Graph, Twitter, JSON-LD) |
| [`styles.css`](styles.css) | Layout and design tokens (`:root`) |
| [`scripts.js`](scripts.js) | Scroll reveals + lazy-loaded Calendly widget |
| [`DESIGN.md`](DESIGN.md) | Short design token / type reference for edits |
| [`images/portrait.jpg`](images/portrait.jpg) | Hero portrait (replace or update paths in `index.html` + social meta if renamed) |
| [`favicon.svg`](favicon.svg) | Favicon |
| [`wrangler.toml`](wrangler.toml) | Cloudflare Worker name + static `[assets]` (repo root → production site) |
| [`_headers`](_headers) | Security + cache headers for [Workers static assets](https://developers.cloudflare.com/workers/static-assets/headers/) (parsed at the edge; not served as a file) |

## First-time Git push (new clone / empty remote)

If this folder is not yet linked to GitHub:

```bash
git init
git add .
git commit -m "Initial site: static Pages layout"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Then connect that repository in the Worker project as in **Deploy map** above.

## Local preview

Serve from **this directory** (repo root) so absolute paths like `/styles.css` and `/images/` resolve.

```bash
python3 -m http.server 8080
```

Or, if you use npm:

```bash
npm run preview
```

Then open `http://localhost:8080`.

## Higgsfield CLI (optional — image/video from agents)

Install and sign in per [Higgsfield CLI](https://higgsfield.ai/cli) / [GitHub](https://github.com/higgsfield-ai/cli):

```bash
npm install -g @higgsfield/cli
higgsfield auth login
```

To add skills to Cursor / Claude Code agents:

```bash
npx skills add higgsfield-ai/skills
```

Auth opens a browser once; credits follow your Higgsfield plan.

## Replacing the hero photo

Swap [`images/portrait.jpg`](images/portrait.jpg) for your file (keep the name, or update the `<img>` in `index.html` and `og:image` / `twitter:image` URLs). Aim for roughly **4:5** aspect ratio for the hero frame.
