# Claude 101 (한국어)

Claude 사용법을 다루는 정적 자기주도 입문 강의입니다.

**라이브:** https://ai.tchung.org/claude-101/

## 개요

5개 섹션(Claude 만나기, 작업과 지식 정리하기, Claude의 활용 범위 넓히기, 실전에 적용하기, 마무리 및 수료증)에 걸친 13개 레슨으로 구성되어 있습니다. 각 레슨에는 본문과 이해도 점검 퀴즈가 포함되어 있으며, 진행 상황은 `localStorage`에 저장되고 100% 완료 시 인쇄 가능한 수료증이 잠금 해제됩니다.

계정 없이, 백엔드 없이, 빌드 단계도 없이 동작합니다.

## 기술 스택

- 일반 HTML, CSS, 바닐라 JavaScript — 프레임워크와 번들러를 사용하지 않습니다.
- 한국어 친화적인 시스템 폰트 스택(`Apple SD Gothic Neo`, `Pretendard`, `Noto Sans KR`, `맑은 고딕`).
- `ai.tchung.org`의 단일 nginx vhost가 정적 파일로 서빙합니다.

## 파일 구조

```
.
├── index.html        # 랜딩 페이지 (히어로 + 커리큘럼 카드)
├── course.html       # 강의 플레이어 (사이드바 + 레슨 + 퀴즈)
├── css/
│   └── styles.css    # 모든 스타일 — 디자인 토큰 + 컴포넌트 + 푸터
└── js/
    ├── curriculum.js # 13개 레슨과 퀴즈 데이터 전체
    ├── landing.js    # 랜딩 페이지의 커리큘럼 카드 렌더링
    └── app.js        # 강의 플레이어: 라우팅, 채점, 진행 상황, 수료증
```

## 로컬 실행

정적 파일 서버라면 어떤 것이든 사용할 수 있습니다. 저장소 루트에서

```bash
python3 -m http.server 8765
open http://localhost:8765/
```

## 콘텐츠 편집

모든 레슨 본문과 퀴즈 문항은 `js/curriculum.js` 안의 단일 `CURRICULUM` 배열에 들어 있습니다. 각 레슨 객체는 다음과 같은 형태입니다.

```js
{
  id: "kebab-case-id",     // course.html의 URL 해시로 사용됩니다
  title: "레슨 제목",
  body: `<p>HTML 본문…</p>`,
  quiz: [
    { q: "질문?", options: ["A", "B", "C"], correct: 1, explain: "해설…" }
  ]
}
```

파일을 편집하고 브라우저를 새로고침하면 끝입니다. 별도의 빌드 단계가 없습니다.

## 배포

사이트는 `ai.tchung.org`의 `/var/www/html/claude-101/` 경로에 위치하며, 기존 nginx vhost가 서빙합니다. 변경 사항을 배포하려면

```bash
scp -r index.html course.html css js root@ai:/var/www/html/claude-101/
```

정적 콘텐츠이므로 nginx를 다시 로드할 필요는 없습니다.

## 크레딧

- 강의 구성과 커리큘럼은 Anthropic의 공식 [Claude 101](https://anthropic.skilljar.com/claude-101)을 기반으로 합니다.
- 푸터 디자인은 [ai-terms](https://ai.tchung.org/ai-terms/) 프로젝트에서 가져왔습니다.
- [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)로 제작되었습니다.
