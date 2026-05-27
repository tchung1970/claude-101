# Claude 101 (Korean)

A static, self-paced introductory course on using Claude — modeled after [anthropic.skilljar.com/claude-101](https://anthropic.skilljar.com/claude-101) and translated for Korean readers.

**Live:** https://ai.tchung.org/claude-101/

## What it is

A 13-lesson course across 5 sections (Claude 만나기, 작업과 지식 정리하기, Claude의 활용 범위 넓히기, 실전에 적용하기, 마무리 및 수료증). Each lesson has reading content + a knowledge-check quiz. Progress is saved in `localStorage` and a printable certificate unlocks at 100% completion.

No accounts, no backend, no build step.

## Stack

- Plain HTML, CSS, and vanilla JavaScript — no framework, no bundler.
- Korean-aware typography via system font stack (`Apple SD Gothic Neo`, `Pretendard`, `Noto Sans KR`, `맑은 고딕`).
- Single nginx vhost on `ai.tchung.org` serves it as static files.

## File layout

```
.
├── index.html        # Landing page (hero + curriculum card)
├── course.html       # Course player (sidebar nav + lesson + quiz)
├── css/
│   └── styles.css    # All styling — design tokens + components + footer
└── js/
    ├── curriculum.js # All 13 lessons + quizzes as a JS data structure
    ├── landing.js    # Renders the curriculum card on the landing page
    └── app.js        # Course player: routing, quiz grading, progress, certificate
```

## Run locally

Any static file server works. From the repo root:

```bash
python3 -m http.server 8765
open http://localhost:8765/
```

## Editing content

All lesson copy and quiz questions live in `js/curriculum.js` as a single `CURRICULUM` array. Each lesson object has:

```js
{
  id: "kebab-case-id",     // used as the URL hash in course.html
  title: "레슨 제목",
  body: `<p>HTML 본문…</p>`,
  quiz: [
    { q: "질문?", options: ["A", "B", "C"], correct: 1, explain: "해설…" }
  ]
}
```

Edit the file, refresh the browser, done. No rebuild step.

## Deploying

The site lives at `/var/www/html/claude-101/` on `ai.tchung.org`, served by the existing nginx vhost. To deploy changes:

```bash
scp -r index.html course.html css js root@ai:/var/www/html/claude-101/
```

No nginx reload needed for static content.

## Credits

- Course structure and curriculum based on Anthropic's official [Claude 101](https://anthropic.skilljar.com/claude-101).
- Footer design borrowed from the [ai-terms](https://ai.tchung.org/ai-terms/) project.
- Built with [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7).
