# create-gitfolio

Open-source portfolio CMS with a built-in admin panel. Markdown blog, project showcase, and full portfolio management — all from a browser UI. Changes auto-commit to GitHub and trigger a Vercel rebuild. No database, no server, no subscription.

**[Live demo →](https://www.kishorkumarmahato.com.np/)**

**[Live demo →](https://gitfolio-tau.vercel.app/)**



![preview](https://raw.githubusercontent.com/cyberkishor/gitfolio/main/docs/screenshots/home.png)

## gitfolio

[![npm version](https://img.shields.io/npm/v/create-gitfolio?color=%236366f1&label=version)](https://www.npmjs.com/package/create-gitfolio)
[![npm downloads](https://img.shields.io/npm/dm/create-gitfolio?color=%2322c55e)](https://www.npmjs.com/package/create-gitfolio)
[![GitHub stars](https://img.shields.io/github/stars/cyberkishor/gitfolio?color=%23f59e0b)](https://github.com/cyberkishor/gitfolio/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/cyberkishor/gitfolio?color=%2306b6d4)](https://github.com/cyberkishor/gitfolio/network/members)
[![last commit](https://img.shields.io/github/last-commit/cyberkishor/gitfolio?color=%23a855f7)](https://github.com/cyberkishor/gitfolio/commits/main)
[![license](https://img.shields.io/npm/l/create-gitfolio?color=%23ef4444)](https://github.com/cyberkishor/gitfolio/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/create-gitfolio)](https://nodejs.org)

**A developer portfolio template with a built-in admin panel.** Edit blog posts, projects, and portfolio data directly from a browser UI — changes auto-commit to GitHub and trigger a Vercel rebuild. No database, no CMS, no server.

Check out the [**live demo →**](https://www.kishorkumarmahato.com.np/) to see gitfolio in action.

> ⭐ **If you find this useful, please star and fork the repo** — it helps others discover it and motivates continued development.
>
> [★ Star on GitHub](https://github.com/cyberkishor/gitfolio) · [🍴 Fork it](https://github.com/cyberkishor/gitfolio/fork) · [🐛 Report an issue](https://github.com/cyberkishor/gitfolio/issues)

---

## Getting Started

### Install

```bash
npm create gitfolio@latest my-portfolio
```

Or with npx:

```bash
npx create-gitfolio my-portfolio
```

The CLI will clone the template, install dependencies, run an interactive setup wizard, and create your first git commit.

### Run locally

```bash
cd my-portfolio
npm run dev    # http://localhost:8080
```

### Deploy

**Step 1 — Create a GitHub repo** for your portfolio (e.g. `my-portfolio`), then push your local code to it:

```bash
cd my-portfolio
git remote add origin https://github.com/YOUR_USERNAME/my-portfolio.git
git push -u origin main
```

**Step 2 — Connect to Vercel.** Import the repo at [vercel.com/new](https://vercel.com/new), add your env vars in Vercel → Settings → Environment Variables, and deploy.

Or skip both steps with the one-click button — Vercel forks the template directly to your GitHub account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcyberkishor%2Fgitfolio&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_OWNER,VITE_GITHUB_REPO,VITE_GITHUB_BRANCH&project-name=my-gitfolio&repository-name=my-gitfolio)

---

## What's included

- **Portfolio site** — hero, about, skills, projects, services, testimonials, blog, contact sections
- **Blog** — markdown-powered posts with cover images, categories, read time, and live preview in the editor
- **Project case studies** — full markdown pages per project with metadata
- **Admin panel** at `/admin` — password-protected, manage all content from the browser
- **Dynamic OG images** — auto-generated for every page and blog post using your accent color and logo
- **Site settings** — logo, favicon, accent color, theme, nav links, footer — all editable in admin
- **Deploy button** in admin sidebar — trigger a Vercel rebuild on demand without pushing a commit

---

## Let's Customize

### Accent color & theme

Set your brand color and preferred theme during `npm run setup`, or edit `src/data/site-settings.json` directly:

```json
{
  "accentColor": "#6366f1",
  "defaultTheme": "dark"
}
```

The accent color propagates as a CSS custom property across the entire site — buttons, highlights, OG images, and more. Supported themes: `dark`, `light`, `system`.

You can also update these at any time from **Admin → Site Settings** without touching code.

### Logo

Replace `public/logo.svg` with your own photo (square, at least 200×200px). JPG and PNG are also supported — update the path in `src/data/site-settings.json`:

```json
{
  "logo": "/logo.jpg",
  "favicon": "/logo.jpg"
}
```

### Navigation & footer

Edit nav links and footer content in `src/data/site-settings.json`, or from **Admin → Site Settings → Navigation / Footer** tabs.

### Personal info

Update name, title, tagline, location, email, social links, and bio in `src/data/portfolio.json`, or from **Admin → Portfolio**.

### Blog posts

Add markdown files to `public/blog/{slug}.md` with frontmatter:

```markdown
---
title: "My First Post"
date: "2024-01-01"
excerpt: "A short description shown in post cards."
cover: "/blog/images/cover.jpg"
readTime: "5 min read"
category: "Engineering"
---

Your content here...
```

Also add an entry to `public/blog-index.json` — or just use the admin panel which handles both automatically.

### Projects

Add markdown files to `public/projects/{slug}.md` with frontmatter:

```markdown
---
title: "My Project"
description: "Short description for the project card."
tags: ["React", "Node.js"]
metrics: "10k+ users"
year: "2024"
category: "SaaS Platform"
liveUrl: "https://example.com"
---

Your case study content here...
```

Also add an entry to `public/projects-index.json` — or use the admin panel.

---

## Admin panel

Visit `/admin` — redirects to `/admin/login` if not authenticated. Password is set via `VITE_ADMIN_PASSWORD`.

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Overview and quick links |
| `/admin/blog` | List, create, edit, delete blog posts |
| `/admin/blog/new` | New post with markdown editor + live preview |
| `/admin/projects` | List, create, edit, delete projects |
| `/admin/projects/new` | New project with markdown editor + live preview |
| `/admin/portfolio` | Edit all portfolio sections |
| `/admin/settings` | Logo, favicon, accent color, nav, footer |

Every save commits directly to GitHub via the API. The Deploy button triggers a Vercel rebuild.

### Admin screenshots

| Dashboard | Blog editor | Site settings |
|-----------|-------------|---------------|
| ![dashboard](https://raw.githubusercontent.com/cyberkishor/gitfolio/main/docs/screenshots/admin-dashboard.png) | ![editor](https://raw.githubusercontent.com/cyberkishor/gitfolio/main/docs/screenshots/admin-editor.png) | ![settings](https://raw.githubusercontent.com/cyberkishor/gitfolio/main/docs/screenshots/admin-settings.png) |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ADMIN_PASSWORD` | Yes | Password for `/admin/login` |
| `VITE_GITHUB_TOKEN` | Yes | GitHub personal access token (`repo` scope) |
| `VITE_GITHUB_OWNER` | Yes | Your GitHub username or org |
| `VITE_GITHUB_REPO` | Yes | Repository name |
| `VITE_GITHUB_BRANCH` | Yes | Branch to commit to — usually `main` |
| `VITE_DEPLOY_HOOK_URL` | Optional | Vercel deploy hook URL |

Set in `.env.local` locally (gitignored). Add the same vars in Vercel → Settings → Environment Variables for production.

**Get a GitHub token:** [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → scope: `repo`.

---

## Tech stack

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v6
- **Markdown:** react-markdown + remark-gfm
- **Icons:** lucide-react
- **Hosting:** Vercel
- **Content:** GitHub API (direct commits from the browser)

---

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=cyberkishor/gitfolio&type=Date)](https://star-history.com/#cyberkishor/gitfolio&Date)

---

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please [open an issue](https://github.com/cyberkishor/gitfolio/issues). To contribute code, fork the repo and open a pull request.

1. [Fork the repo](https://github.com/cyberkishor/gitfolio/fork)
2. Create a branch: `git checkout -b my-feature`
3. Commit your changes and push
4. Open a pull request

---

## License

[![license](https://img.shields.io/npm/l/create-gitfolio?color=%23ef4444)](https://github.com/cyberkishor/gitfolio/blob/main/LICENSE)

MIT © [Kishor Kumar Mahato](https://www.kishorkumarmahato.com.np/)

---

## Keywords

`portfolio` · `developer-portfolio` · `vite` · `react` · `typescript` · `admin-panel` · `blog` · `markdown` · `vercel` · `template`
