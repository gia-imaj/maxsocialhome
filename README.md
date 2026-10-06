# Max's Social House — homepage

Static site built from the Figma file "Untitled" (`WsIGSL1hlkU1OYJswcUmLU`, section **Home** plus the `/page` accordion states). Plain HTML, CSS and JS. No build step.

## Structure

- `index.html` — page markup
- `css/styles.css` — design tokens at the top (colors, type, fluid sizes)
- `js/main.js` — mobile menu, scroll reveals, Spaces accordion, reviews carousel
- `fonts/` — PP Formula Condensed Black, The Bristers Script
- `assets/` — images exported from Figma
- `scripts/figma-assets.tsv` — which Figma image becomes which file

## Interactions

- **The Spaces**: hover a panel to open it, click to pin it. Arrow keys move between spaces. On phones, tap to open.
- **Reviews**: auto-advances every 6s, pauses on hover. Swipe, tap a side card, or use the dots.
- **Dish cards**: hover slides up the View Menu bar.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`. It downloads any missing Figma images into `assets/`, commits them, and publishes to GitHub Pages.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The Figma image links expire about a week after export (around 2026-10-12). After the first successful run the images live in the repo, so that only matters if the first run happens late. If it fails, export the layers from Figma into `assets/` using the names in `scripts/figma-assets.tsv`.

## Before launch

- Body type is Figtree. Swap in licensed TT Norms Pro web fonts (Medium, Bold, ExtraBold); the block is ready in `css/styles.css`.
- Placeholder content: three identical reviews, "Band Name One" event cards, `#` links for reservations, Instagram and Facebook.
