# sameerchib.com

**Purpose:** Source of truth for the personal site at [sameerchib.com](https://sameerchib.com/) — static HTML, CSS, and JS (no bundler).

| Layer | Where |
|--------|--------|
| **Repository** | https://github.com/reemas1111/sameerchib-com (`main`) |
| **Hosting** | [Cloudflare Pages](https://developers.cloudflare.com/pages/) — Workers & Pages project **`sameerchib`** |
| **Domain** | `sameerchib.com` (custom domain on that Pages project; DNS in Cloudflare) |

Pushes to `main` trigger a production deploy; pull requests get preview URLs once Git is connected to the Pages project.

## Deploy map (Cloudflare Pages)

1. **Cloudflare Dashboard** → **Workers & Pages** → **`sameerchib`**.
2. **Settings** → **Builds & deployments** → connect **GitHub** → select **`reemas1111/sameerchib-com`**, production branch **`main`**.
3. **Build configuration** (static, no build step):

   | Setting | Value |
   |---------|--------|
   | Framework preset | **None** |
   | Build command | *(empty)* |
   | Build output directory | **`/`** or **`.`** (repo root — folder that contains `index.html`) |

4. **Custom domains**: attach **sameerchib.com** to this Pages project if not already.

## Repo layout (what to edit)

| File / folder | Role |
|---------------|------|
| [`index.html`](index.html) | Page structure, copy, meta (SEO, Open Graph, Twitter, JSON-LD) |
| [`styles.css`](styles.css) | Layout and design tokens (`:root`) |
| [`scripts.js`](scripts.js) | Scroll reveals + lazy-loaded Calendly widget |
| [`DESIGN.md`](DESIGN.md) | Short design token / type reference for edits |
| [`images/portrait.jpg`](images/portrait.jpg) | Hero portrait (replace or update paths in `index.html` + social meta if renamed) |
| [`favicon.svg`](favicon.svg) | Favicon |
| [`_headers`](_headers) | Cloudflare Pages response headers (security + cache hints) |

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

Then connect that repository in the Pages project as in **Deploy map** above.

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` (root must be this directory so `/styles.css` and `/images/` resolve).

## Replacing the hero photo

Swap [`images/portrait.jpg`](images/portrait.jpg) for your file (keep the name, or update the `<img>` in `index.html` and `og:image` / `twitter:image` URLs). Aim for roughly **4:5** aspect ratio for the hero frame.
