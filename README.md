# ATBC — Australia Thailand Business Council

Modern, editorial-style website draft for senior stakeholder review.

## Preferred File

Open **`index.html`** in any browser — no build step required.

`version-fullscreen-logo.html` redirects to `index.html`.

## Design Direction

- Fullscreen ATBC banner logo hero
- Editorial, image-led layout inspired by council/consulting Wix template style
- Navy · Gold · Red color palette (Australian and Thai flag references)
- Playfair Display serif headings + Inter body text
- Smooth scroll navigation, scroll-reveal animations, scroll progress bar
- Transparent-to-solid header on scroll

## Sections

| Section | ID |
|---|---|
| Hero / Fullscreen Logo | `#home` |
| About Us | `#about` |
| President Statement | `#president` |
| Leadership & Board | `#board` |
| Memberships | `#membership` |
| Individual Membership Detail | `#member-individual` |
| Organisation Membership Detail | `#member-organisation` |
| Sponsor | `#sponsor` |
| Silver Sponsor | `#sponsor-silver` |
| Gold Sponsor | `#sponsor-gold` |
| Platinum Sponsor | `#sponsor-platinum` |
| Mission & Vision | `#mission` |
| Strategic Partners | `#partners` |
| Activity / Updates | `#activity` |
| Contact | `#contact` |

## Interactive Features

- **President statement editor** — edit + save via localStorage (demo)
- **Activity posting form** — posts to feed, persisted in localStorage
- **Mission pillar selector** — click 01/02/03 to see detail text update
- **Contact form** — demo submit with toast confirmation
- **Mobile menu** — animated hamburger toggle
- **Scroll spy** — active nav link updates as you scroll
- **Scroll progress bar** — top of page

## Files

```
index.html              — main website
styles.css              — all styling
script.js               — all interactions
assets/
  atbc-banner-logo.png  — ATBC official banner (hero)
  logo.png              — ATBC logo (header)
  australia.jpg         — background
  thailand.jpg          — background
  australia-harbour.jpg — editorial image
  thailand-temple.jpg   — editorial / president portrait
  business-skyline.jpg  — sponsor section
```

## Contact

info@aust-thai.org.au · www.aust-thai.org.au

---

*Draft for senior review — July 2026. Not for public release.*
