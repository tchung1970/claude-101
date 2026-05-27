# Claude 101 (한국어)

Claude 사용법을 스스로 익히는 **무료** 입문 강의입니다.

**라이브:** https://ai.tchung.org/claude-101/

## 한눈에 보기

- **13개 레슨** · 5개 섹션 구성
- **레슨마다 퀴즈** · 이해도 점검
- **수료증** · 완주 시 발급
- **회원가입 불필요** · 진행 상황은 브라우저에 저장

5개 섹션: Claude 만나기 / 작업과 지식 정리하기 / Claude의 활용 범위 넓히기 / 실전에 적용하기 / 마무리 및 수료증.

## 기술 스택

- 순수 HTML, CSS, 바닐라 JavaScript — 프레임워크나 번들러는 쓰지 않습니다.
- 한국어가 잘 표시되도록 시스템 폰트(`Apple SD Gothic Neo`, `Pretendard`, `Noto Sans KR`, `맑은 고딕`)를 우선 사용합니다.
- `ai.tchung.org`의 nginx가 정적 파일로 제공합니다.

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

정적 파일 서버 아무거나 쓰면 됩니다. 저장소 루트에서

```bash
python3 -m http.server 8765
open http://localhost:8765/
```

## 콘텐츠 편집

모든 레슨 본문과 퀴즈 문항은 `js/curriculum.js`의 `CURRICULUM` 배열 하나에 모여 있습니다. 각 레슨은 다음과 같은 형태입니다.

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

파일을 고치고 브라우저를 새로고침하면 끝입니다. 빌드 단계가 따로 없습니다.

## 배포

사이트는 `ai.tchung.org`의 `/var/www/html/claude-101/` 경로에 있고, 기존 nginx가 그대로 띄워 줍니다. 변경 사항을 올리려면

```bash
scp -r index.html course.html css js root@ai:/var/www/html/claude-101/
```

정적 파일이라 nginx를 다시 띄울 필요는 없습니다.

## 크레딧

- 강의 구성과 커리큘럼은 Anthropic 공식 [Claude 101](https://anthropic.skilljar.com/claude-101)을 참고했습니다.
- [Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)로 만들었습니다.
