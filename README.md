# DIF Aarhus — dif-aarhus.dk

A modern, faithful redesign of the website for **Dansk-Israelsk Forening Aarhus** — the Danish-Israeli Association in Aarhus, founded 8 March 1976.

## Pages

**Danish (default)**
- `/` — Forside
- `/aktuelt.html` — Aktuelt (news, helligdage, notitser)
- `/om-foreningen.html` — Om foreningen (history, principles, board)
- `/aktiviteter.html` — Aktiviteter (lecture series, archive teaser)
- `/foredragsraekken-arkiv.html` — Foredragsrækkens arkiv (1999 → today)
- `/medlemskab.html` — Medlemskab (fees, four ways to join, bank details)
- `/fakta.html` — Fakta om Israel (Hatikva, holidays, 27 maps, Hebrew, kosher, climate, MDA, biographies)
- `/foreninger.html` — Foreninger i Danmark (org cards with logos)
- `/kultur.html` — Kultur (books, film, music, Dry Bones, jødisk humor)
- `/links.html` — Links (9 categories)
- `/danske-joeder.html` — De danske jøders historie (400 years)
- `/oktober-43.html` — Redningen af de danske jøder, oktober 1943
- `/stoet-israel.html` — Humanitære organisationer (MDA, Keren Hayesod, KKL, WIZO, Yad Vashem, Jewish Agency)
- `/kontakt.html` — Kontakt + bestyrelse + form
- `/privatlivspolitik.html` — GDPR-compliant persondatapolitik

**English mirror at `/en/`** — `index.html`, `about.html`, `events.html`, `membership.html`, `contact.html`

**Operational** — `404.html`, `sitemap.xml`, `robots.txt`, `.htaccess`, `site.webmanifest`, `sw.js`,
plus 12 legacy redirect stubs.

## What's special

### Design
- **Palette** — deep navy (`#0c2240`) + warm gold (`#c9a14a`) + terracotta accent.
- **Typography** — Cormorant Garamond (display, italic accents), Source Serif 4 (prose), Inter (UI), Frank Ruhl Libre (Hebrew with proper `lang="he" dir="rtl"`).
- **Light + dark theme** — system default + manual toggle, persisted in `localStorage`.
- **Hatikva** — bilingual lyric block (Danish + Hebrew) on front and facts pages.
- **Imagery** — every original image and logo from the legacy site is woven in.

### Architecture
- Pure static HTML, single CSS and JS file. No framework, no build step, no backend.
- Service worker (`sw.js`) for **offline-first PWA** caching.
- WebP companions for all 50 raster images (~60% smaller than originals).
- `.htaccess` with HTTPS redirect, www canonicalization, 301 legacy redirects, gzip, cache headers, security headers (X-Frame-Options, Permissions-Policy, X-Content-Type-Options, Referrer-Policy).
- Custom **404** with full nav + search.

### Functionality
- **Client-side site search** (`/` shortcut or `Cmd/Ctrl-K`) — pre-built JSON index, with snippet highlighting and keyboard navigation.
- **Bilingual contact form** with mailto fallback, error/success states.
- **Back-to-top** button after 600 px scroll.
- **Mobile menu** with backdrop, focus trap, escape-to-close.
- **Reveal animations** — `IntersectionObserver`-driven, with stagger.
- **Print stylesheet** — clean output for membership form, bank details, etc.

### Accessibility
- Semantic HTML5 landmarks, skip link, visible focus rings on all interactive elements.
- `prefers-reduced-motion` respected throughout.
- ARIA on dynamic controls (theme toggle, menu toggle, search modal as `role="dialog" aria-modal="true"`).
- Hebrew passages carry `lang="he" dir="rtl"` so screen readers announce them correctly.

### SEO & web vitals
- Per-page `<title>`, meta description, Open Graph image (`venskabsflagdkisrael.jpg`).
- JSON-LD `Organization` on the front page.
- `hreflang` alternates DA / EN / x-default.
- `sitemap.xml` with priorities and changefreq.
- `theme-color` meta + manifest for PWA install.

### Privacy
- **No analytics, no tracking, no third-party cookies.** Only `localStorage` for the theme preference.
- Privacy policy (`/privatlivspolitik.html`) explains data flows in plain Danish.

## Local preview

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Updating content

- **News (Aktuelt)** — edit `aktuelt.html`; duplicate a `<article class="news-item">`.
- **Events** — duplicate an `.activity` block in `aktiviteter.html` / `en/events.html`.
- **Organisations** — duplicate an `.org` card in `foreninger.html`.
- **Links** — duplicate a `<li>` inside any `.resource-list` in `links.html`.
- **Search index** — re-run the build script to refresh `assets/search.json` and `assets/search-en.json` after major copy changes.
- **Membership fees / bank details** — `medlemskab.html` and `en/membership.html`.
- **Contact email** — `kontakt.html`, `en/contact.html`, plus all footers (`mailto:dif_webmaster@yahoo.dk`).

## Deployment notes

Upload the entire folder to the existing webhost (Team.blue / DanDomain). The `.htaccess` will activate automatically on Apache. The service worker will register on first visit; users will get app-like behaviour on install.

After deployment, re-test:
- Sitemap in Google Search Console
- WebP support (any modern browser since 2020)
- Service worker registration in DevTools → Application
- Hebrew rendering on iOS/Android
