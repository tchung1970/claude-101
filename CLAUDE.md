# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run and deploy

```bash
# Local
python3 -m http.server 8765
open http://localhost:8765/

# Deploy (production)
scp -r index.html course.html og.png css js root@ai:/var/www/html/claude-101/

# Regenerate the OG preview image after changing copy or palette
python3 make_og.py
```

Production site: https://ai.tchung.org/claude-101/ — served as static files by the existing nginx vhost on `ai.tchung.org`. No build step. No reload needed for static file changes.

There is no test suite, linter, or build pipeline. Sanity-check JS changes with `node --check js/*.js`.

## Architecture

Two HTML pages share one design system and one data source:

- **`index.html`** — landing page. Reads `CURRICULUM` from `js/curriculum.js` via `js/landing.js` to render the curriculum card on the right side.
- **`course.html`** — course player. `js/app.js` flattens `CURRICULUM` into a lesson list, then handles all routing (URL hash → lesson), rendering, quiz grading, progress persistence (`localStorage` key `claude101.progress.v1`), and the certificate unlock.

**`js/curriculum.js` is the single source of truth for all course content.** Adding a lesson means adding an entry there — no other file changes required. Each lesson has `id`, `title`, HTML `body`, and a `quiz` array. The `certificate` lesson is special-cased in `app.js` (custom render, unlocks the moment all real lessons are complete).

**Certificate is not a lesson.** The user-facing count is "12개 레슨" (only the entries before `id: "certificate"`). `app.js` enforces this via `totalLessonCount()` and `completedCount()`, which both filter out `id === "certificate"`. The cert acts as the completion reward, not the 13th item — if you add or remove a lesson, update the static "12개 레슨" strings in `index.html`, `course.html`, and `README.md` to match, but don't change the `app.js` filter logic.

`css/styles.css` is organized top-down: design tokens (`:root`) → reset → nav → containers → buttons → landing sections → curriculum card → course player (sidebar + lesson + quiz + certificate) → footer. There is no CSS framework.

## Content conventions

- **Language:** Korean. UI strings, lesson bodies, and quiz copy are all Korean. Keep Anthropic product/feature names in English (`Claude`, `Chat`, `Cowork`, `Code`, `Skills`, `Artifacts`, `Claude API`, `Claude Code`) — Korean users refer to them that way.
- **Korean tone:** prefer plain, conversational Korean over stiff translation-ese (`정적 자기주도` → `스스로 익히는`, `포함되어 있으며` → `있고`, `잠금 해제됩니다` → `열립니다`, `서빙합니다` → `제공합니다`). Aim for "written, not translated."
- **Quiz format:** the question prefix is `Q{lesson_index + 1}.` so numbering runs globally (Q1 through Q12 across the course, one question per lesson). Options are auto-prefixed `A.`/`B.`/`C.`/`D.` via `String.fromCharCode(65 + oi)` in `renderLesson()` — the `correct` field in `curriculum.js` stays as a 0-based index.
- **Auto-completion:** a lesson flips to complete the moment `gradeQuiz()` sees `correct === total` — no separate button click needed once the learner gets a perfect score. The "완료로 표시" button is the fallback path for the cert lesson and for skipping the quiz.
- **Font stack** (in `:root --sans`) prioritizes `Apple SD Gothic Neo` (macOS), `Pretendard`, `Noto Sans KR`, and `맑은 고딕` (Windows). `:lang(ko) { word-break: keep-all }` is set globally so hangul doesn't break mid-word.
- **Footer** matches the style used on https://ai.tchung.org/ai-terms/ (centered, dotted-underline links, Anthropic sunburst SVG + GitHub octocat). When editing the footer, keep both pages in sync — the markup is duplicated in `index.html` and `course.html`.

## Local-only files

- **`answers.md`** — flat Q1–Q12 answer sheet for the maintainer (one line per question: question + `→ B. ...` correct option). Gitignored via `.gitignore`. Regenerate by hand from `js/curriculum.js` whenever quiz data changes; there's no script. Don't commit it — the URL in the footer would leak the answers.

## Deployment target

The server `root@ai` (= `ai.tchung.org`) hosts multiple static sites under `/var/www/html/<project>/`, each served at `https://ai.tchung.org/<project>/` by a single nginx vhost. This repo deploys to `/var/www/html/claude-101/`. See also `~/.claude/projects/-Users-tchung-claude-claude-101/memory/reference_ai_server.md` for the full server layout.
