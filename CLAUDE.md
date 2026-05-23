# Komunios — Project Context for Claude

## Read These First
Before doing any work, read the skill files in `.claude/skills/`:
- **PROJECT_OVERVIEW.md** — what Komunios is, target market, competitor rules, founder context
- **DESIGN_SYSTEM.md** — colors, typography, spacing, component rules
- **GEORGIAN_STYLE.md** — Georgian language rules, vocabulary, grammar pitfalls
- **STATUS.md** — what's built, what's in progress, known issues

These files are the source of truth for this project. Always read them at the start of a session.

---

## Project Overview
Komunios is a Georgian digital platform that transforms apartment buildings into real communities. It combines financial management, social features, and hardware integration (lifts, doors, cameras).

**Live site:** https://komunios.netlify.app
**Stack:** Static HTML/CSS/JS — no build step, no framework.

See `.claude/skills/PROJECT_OVERVIEW.md` for full details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | Custom CSS (`style.css`) + Tailwind CSS via CDN |
| Scripting | Vanilla JS (`script.js`) |
| Icons | Lucide Icons via CDN |
| Font | Noto Sans Georgian (Google Fonts) |
| Forms | Formspree → info@komunios.ge |
| Chatbot | Netlify Function (`netlify/functions/chat.js`) + Anthropic API (Claude Haiku 4.5) |
| Deployment | Netlify — auto-deploy on `git push` to `main` |

---

## File Structure

```
komunio/
├── CLAUDE.md                  ← you are here
├── index.html                 ← main landing page
├── services.html              ← detailed services (11 sections)
├── about.html                 ← about us
├── blog.html                  ← blog listing
├── blog-citycom-comparison.html
├── blog-five-signs.html
├── blog-why-buildings.html
├── style.css                  ← all custom styles
├── script.js                  ← all JS (animations, forms, chatbot UI)
├── netlify.toml               ← Netlify config (function routing)
├── package.json
├── netlify/
│   └── functions/
│       └── chat.js            ← serverless function for AI chatbot
└── .claude/
    └── skills/                ← Claude context files (read these!)
        ├── PROJECT_OVERVIEW.md
        ├── DESIGN_SYSTEM.md
        ├── GEORGIAN_STYLE.md
        └── STATUS.md
```

---

## Key Conventions

### Language
- **Georgian** for all user-facing text (UI, marketing copy, buttons, labels)
- **English** for code, comments, variable names, HTML attributes
- See `.claude/skills/GEORGIAN_STYLE.md` for vocabulary rules and grammar pitfalls

### Design
- Primary color: `#F97316` (orange)
- Background: `#FAFAF9` (warm off-white — never pure white)
- Font: "Noto Sans Georgian" everywhere
- Cards: `rounded-2xl`, buttons: `rounded-xl`
- See `.claude/skills/DESIGN_SYSTEM.md` for full system

### Vocabulary (critical)
- Say **მეზობელი** (neighbor) — NOT მფლობელი (owner)
- Say **თემი** (community) — NOT სისტემა (system)
- Never name the competitor — say "ბაზარზე არსებული გადაწყვეტები"

### Code style
- No build step — edit files directly, no compilation needed
- Tailwind utility classes for layout, `style.css` for custom components
- All JS in `script.js` — no modules, no bundler

---

## How to Deploy

```
git add <files>
git commit -m "Your message"
git push
```

Netlify auto-deploys from `main` branch. Changes are live within ~30 seconds of push.

**Environment variables on Netlify** (do not commit these):
- `ANTHROPIC_API_KEY` — used by `netlify/functions/chat.js`

---

## Important Rules

1. **Make all technical decisions yourself** — the founder (Gogish) is non-technical
2. **Always commit and push after major changes** — deploy confirms the work is live
3. **Never mention competitors by name** in any user-facing content
4. **Stats are goals/vision, not achievements** — framed as "მიზანი" not current numbers
5. **Short Georgian sentences** — fewer words = fewer grammar errors
6. **Read STATUS.md** to know what's already built before starting work
