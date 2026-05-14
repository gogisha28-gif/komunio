# Komunios — Landing Page

A modern, warm Georgian-language landing page for **Komunios**, a community platform for apartment buildings.

## Quick Start

1. Open `index.html` in any browser — no server or build step needed.
2. That's it. The site works offline.

## File Overview

| File | What it does |
|---|---|
| `index.html` | The entire page structure — all 7 sections from navbar to footer, written in Georgian. |
| `style.css` | Custom styles on top of Tailwind: scroll animations, hover effects, mobile tweaks. |
| `script.js` | Email form handling (saves to localStorage), mobile menu, navbar shadow, scroll reveal. |

## Email Signups

Submitted emails are stored in the browser's `localStorage` under the key `komunios_emails`.  
To view them, open the browser console and run:

```js
JSON.parse(localStorage.getItem("komunios_emails"))
```

When you're ready for a real backend, replace the `saveEmail()` function in `script.js` with an API call (e.g., to Mailchimp, ConvertKit, or a custom endpoint).

## Design System

- **Primary:** `#F97316` (warm orange)
- **Secondary:** `#10B981` (natural green)
- **Font:** Noto Sans Georgian (loaded from Google Fonts)
- **Style:** Flat, lots of whitespace, rounded-2xl corners, soft shadows — no gradients

## Next Steps

- [ ] Connect email form to a real backend (Mailchimp / Supabase / custom API)
- [ ] Add a real domain and deploy (Netlify, Vercel, or GitHub Pages — all free)
- [ ] Add Open Graph meta tags for social sharing previews
- [ ] Build the actual app 🚀
