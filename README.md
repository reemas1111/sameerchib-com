# sameerchib.com

Personal site for Sameer Chib — static HTML, CSS, and JS deployed to **Cloudflare Pages** (project: `sameerchib`).

## Repo layout

| File / folder | Role |
|---------------|------|
| [`index.html`](index.html) | Page structure, copy, meta (SEO, Open Graph, Twitter, JSON-LD) |
| [`styles.css`](styles.css) | All layout and visual design tokens |
| [`scripts.js`](scripts.js) | Scroll reveals + lazy-loaded Calendly widget |
| [`images/portrait.jpg`](images/portrait.jpg) | Hero portrait (replace with your preferred headshot) |
| [`favicon.svg`](favicon.svg) | Favicon |
| [`_headers`](_headers) | Cloudflare Pages response headers (security + cache hints) |

## Deploy with GitHub (auto-updates on push)

1. Create a GitHub repository (empty, no README if you will push this repo).
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial site: static Pages layout"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
   git push -u origin main
   ```
3. In **Cloudflare Dashboard** → **Workers & Pages** → project **`sameerchib`** → **Settings** → **Builds & deployments** → connect the GitHub repository.
4. Build settings for a static site with **no bundler**:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (root of the repo — the directory that contains `index.html`)

Every push to the production branch redeploys the live site. Pull requests get preview URLs.

5. Under **Custom domains**, keep **sameerchib.com** pointed at this Pages project (DNS on Cloudflare should already list the domain).

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` (root must be this directory so `/styles.css` and `/images/` resolve).

## Replacing the hero photo

Swap [`images/portrait.jpg`](images/portrait.jpg) for your file (keep the name, or update the `<img>` in `index.html` and `og:image` / `twitter:image` URLs). Aim for roughly **4:5** aspect ratio for the hero frame.
