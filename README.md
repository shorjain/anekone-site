# anekone.com

The website of **Anekone**, an AI research company. *Many perspectives. One intelligence.*

Static site: plain HTML, CSS and vanilla JavaScript, no build step. Served by GitHub Pages at [anekone.com](https://anekone.com).

## Files

| File | What it is |
|------|------------|
| `index.html` | The whole site: hero, research, products, about, contact |
| `styles.css` | Styles and brand tokens |
| `main.js` | Quiet interactions: Fig. 1 signals, Fig. 6 forecast horizon, Fig. 7 parcels, nav marker, copy email |
| `CNAME` | `anekone.com` |
| `favicon.ico`, `favicon.svg`, `favicon-32x32.png`, `favicon-64x64.png`, `apple-touch-icon.png` | Favicons |
| `logo/` | Mark (SVG, 512 px PNG), app icon (512 px PNG), lockup SVG |

## Brand

- Colors: ink `#0B0F1A`, panel `#111827`, hairline `#232a3a`, text `#F4F6FA`, muted `#A7AFBF`, accent `#3B5BFD` (used sparingly), light blue `#7D93FF` (focus rings)
- Type: Space Grotesk 500/700 (headings, wordmark), Inter 400/500 (body), IBM Plex Mono (figure labels)
- Wordmark: lowercase `anēkone`. Plain "Anekone" everywhere else.

## Interaction rules

Only opacity, color and line-drawing transitions (300–500 ms), plus a one-time 8 px fade-in on scroll. No gradients, glows, tilts, parallax or emoji. With `prefers-reduced-motion` turned on, all transitions are off.

## Running locally

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploying

1. **Settings → Pages**: deploy from branch `main`, folder `/ (root)`. Set the custom domain to `anekone.com` and turn on **Enforce HTTPS** once the certificate is issued.
2. DNS at your registrar:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records for `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` for `www` → `<github-username>.github.io`

GitHub Pages from a **private** repository requires a paid GitHub plan.

## Contact

info.anekone@gmail.com

© 2026 Anekone. All rights reserved.
