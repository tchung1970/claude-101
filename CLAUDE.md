# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run and deploy

```bash
# Local
python3 -m http.server 8765
open http://localhost:8765/

# Deploy (production)
scp -r index.html course.html css js root@ai:/var/www/html/claude-101/
```

Production site: https://ai.tchung.org/claude-101/ — served as static files by the existing nginx vhost on `ai.tchung.org`. No build step. No reload needed for static file changes.

There is no test suite, linter, or build pipeline. Sanity-check JS changes with `node --check js/*.js`.

## Architecture

Two HTML pages share one design system and one data source:

- **`index.html`** — landing page. Reads `CURRICULUM` from `js/curriculum.js` via `js/landing.js` to render the curriculum card on the right side.
- **`course.html`** — course player. `js/app.js` flattens `CURRICULUM` into a lesson list, then handles all routing (URL hash → lesson), rendering, quiz grading, progress persistence (`localStorage` key `claude101.progress.v1`), and the certificate unlock.

**`js/curriculum.js` is the single source of truth for all course content.** Adding a lesson means adding an entry there — no other file changes required. Each lesson has `id`, `title`, HTML `body`, and a `quiz` array. The `certificate` lesson is special-cased in `app.js` (custom render, unlocks only when every other lesson is marked complete).

`css/styles.css` is organized top-down: design tokens (`:root`) → reset → nav → containers → buttons → landing sections → curriculum card → course player (sidebar + lesson + quiz + certificate) → footer. There is no CSS framework.

## Content conventions

- **Language:** Korean. UI strings, lesson bodies, and quiz copy are all Korean. Keep Anthropic product/feature names in English (`Claude`, `Chat`, `Cowork`, `Code`, `Skills`, `Artifacts`, `Claude API`, `Claude Code`) — Korean users refer to them that way.
- **Font stack** (in `:root --sans`) prioritizes `Apple SD Gothic Neo` (macOS), `Pretendard`, `Noto Sans KR`, and `맑은 고딕` (Windows). `:lang(ko) { word-break: keep-all }` is set globally so hangul doesn't break mid-word.
- **Footer** matches the style used on https://ai.tchung.org/ai-terms/ (centered, dotted-underline links, Anthropic sunburst SVG + GitHub octocat). When editing the footer, keep both pages in sync — the markup is duplicated in `index.html` and `course.html`.

## Deployment target

The server `root@ai` (= `ai.tchung.org`) hosts multiple static sites under `/var/www/html/<project>/`, each served at `https://ai.tchung.org/<project>/` by a single nginx vhost. This repo deploys to `/var/www/html/claude-101/`. See also `~/.claude/projects/-Users-tchung-claude-claude-101/memory/reference_ai_server.md` for the full server layout.
