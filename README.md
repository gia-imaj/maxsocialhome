# Max's Social House — homepage

Static site built from the Figma file "Untitled" (`WsIGSL1hlkU1OYJswcUmLU`, section **Home** plus the `/page` accordion states). Plain HTML, CSS and JS. No build step.

## Structure

- `index.html` — page markup
- `css/styles.css` — design tokens at the top (colors, type, fluid sizes)
- `js/main.js` — mobile menu, scroll reveals, Spaces accordion, reviews carousel
- `fonts/` — PP Formula Condensed Black, The Bristers Script, TT Norms Pro (Medium, Bold, Black)
- `assets/` — images exported from Figma, plus background videos (`hero.*`, `come-hungry.*`)
- `scripts/figma-assets.tsv` — which Figma image becomes which file

## Interactions

- **The Spaces**: hover a panel to open it, click to pin it. Arrow keys move between spaces. On phones, tap to open.
- **Reviews**: auto-advances every 6s, pauses on hover. Swipe, tap a side card, or use the dots.
- **Dish cards**: hover slides up the View Menu bar.

## Background videos

Hero and Come Hungry play muted looping video over their still image. Each clip ships as MP4 (Safari) and WebM (smaller, for Chrome and Firefox). The still shows until the video is playing, and stays if the video fails or the visitor has reduced motion turned on. Videos pause when scrolled offscreen.

To swap a clip, compress it first so the page stays fast:

    ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart assets/hero.mp4
    ffmpeg -i in.mp4 -an -c:v libvpx-vp9 -crf 38 -b:v 0 assets/hero.webm

Darkness is set per section with `--video-opacity` in `css/styles.css`.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`. It downloads any missing Figma images into `assets/`, commits them, and publishes to GitHub Pages.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

The Figma image links expire about a week after export (around 2026-10-12). After the first successful run the images live in the repo, so that only matters if the first run happens late. If it fails, export the layers from Figma into `assets/` using the names in `scripts/figma-assets.tsv`.

## Before launch

- Large titles use TT Norms Pro Black in place of the ExtraBold in Figma. Add an ExtraBold woff2 to match exactly.
- Placeholder content: three identical reviews, "Band Name One" event cards, `#` links for reservations, Instagram and Facebook.
