// Course player: sidebar nav, lesson rendering, quiz grading,
// progress persistence in localStorage, and certificate unlock.
(function () {
  const STORE_KEY = "claude101.progress.v1";
  const NAME_KEY = "claude101.name";

  // ---- Flatten lessons for indexed nav ----
  const ALL_LESSONS = [];
  window.CURRICULUM.forEach((section) => {
    section.lessons.forEach((lesson) => {
      ALL_LESSONS.push({ ...lesson, section: section.section });
    });
  });

  // ---- Progress state ----
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  function saveProgress(p) {
    localStorage.setItem(STORE_KEY, JSON.stringify(p));
  }
  let progress = loadProgress();

  function isComplete(id) { return !!progress[id]; }
  function markComplete(id) {
    progress[id] = { completedAt: new Date().toISOString() };
    saveProgress(progress);
  }
  // Certificate isn't a lesson — exclude it from the progress count.
  function totalLessonCount() {
    return ALL_LESSONS.filter((l) => l.id !== "certificate").length;
  }
  function completedCount() {
    return ALL_LESSONS.filter((l) => l.id !== "certificate" && isComplete(l.id)).length;
  }
  function allComplete() {
    return completedCount() === totalLessonCount();
  }

  // ---- Sidebar render ----
  const sidebar = document.getElementById("sidebar");
  function renderSidebar(activeId) {
    // Remove any previous sections (keep h2 + progress)
    [...sidebar.querySelectorAll(".section-title, ul")].forEach((el) => el.remove());

    window.CURRICULUM.forEach((section) => {
      const h = document.createElement("div");
      h.className = "section-title";
      h.textContent = section.section;
      sidebar.appendChild(h);

      const ul = document.createElement("ul");
      section.lessons.forEach((lesson) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.dataset.id = lesson.id;
        btn.className =
          (lesson.id === activeId ? "active " : "") +
          (isComplete(lesson.id) ? "done" : "");
        btn.innerHTML = `<span class="check">${isComplete(lesson.id) ? "✓" : ""}</span><span>${lesson.title}</span>`;
        btn.addEventListener("click", () => navigateTo(lesson.id));
        li.appendChild(btn);
        ul.appendChild(li);
      });
      sidebar.appendChild(ul);
    });

    // Progress bar
    const total = totalLessonCount();
    const done = completedCount();
    document.getElementById("progress-bar").style.width = `${Math.round((done / total) * 100)}%`;
    document.getElementById("progress-text").textContent = `${total}개 레슨 중 ${done}개 완료`;
  }

  // ---- Lesson render ----
  const pane = document.getElementById("lesson-pane");
  function renderLesson(id) {
    const idx = ALL_LESSONS.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const lesson = ALL_LESSONS[idx];
    const prev = ALL_LESSONS[idx - 1];
    const next = ALL_LESSONS[idx + 1];

    if (lesson.id === "certificate") {
      renderCertificate();
      return;
    }

    const quizHtml = lesson.quiz && lesson.quiz.length
      ? `
        <div class="quiz" id="quiz">
          <h3>이해도 점검</h3>
          ${lesson.quiz.map((q, qi) => `
            <div class="q" data-qi="${qi}">
              <p><strong>Q${idx + 1}.</strong> ${q.q}</p>
              <div class="options">
                ${q.options.map((opt, oi) => `
                  <label data-oi="${oi}">
                    <input type="radio" name="q${qi}" value="${oi}" />
                    <span><strong>${String.fromCharCode(65 + oi)}.</strong> ${opt}</span>
                  </label>
                `).join("")}
              </div>
              <div class="feedback" id="fb-${qi}"></div>
            </div>
          `).join("")}
          <div class="row" style="margin-top: 1rem;">
            <button class="btn btn-primary" id="grade-btn">정답 확인</button>
            <span class="muted" id="grade-result"></span>
          </div>
        </div>
      `
      : "";

    pane.innerHTML = `
      <div class="crumb">${lesson.section} · 레슨 ${idx + 1} / ${totalLessonCount()}</div>
      <h1>${lesson.title}</h1>
      <div class="body">${lesson.body}</div>
      ${quizHtml}
      <div class="lesson-footer">
        <div>
          ${prev ? `<button class="btn btn-ghost" id="prev-btn">← ${escapeHtml(prev.title)}</button>` : ""}
        </div>
        <div class="row">
          <button class="btn ${isComplete(lesson.id) ? "btn-ghost" : "btn-primary"}" id="complete-btn">
            ${isComplete(lesson.id) ? "완료됨 ✓" : "완료로 표시"}
          </button>
          ${next ? `<button class="btn btn-accent" id="next-btn">${escapeHtml(next.title)} →</button>` : ""}
        </div>
      </div>
    `;

    if (prev) document.getElementById("prev-btn").addEventListener("click", () => navigateTo(prev.id));
    if (next) document.getElementById("next-btn").addEventListener("click", () => navigateTo(next.id));

    document.getElementById("complete-btn").addEventListener("click", () => {
      markComplete(lesson.id);
      renderSidebar(lesson.id);
      // 버튼 라벨 갱신
      document.getElementById("complete-btn").outerHTML =
        `<button class="btn btn-ghost" id="complete-btn">완료됨 ✓</button>`;
      document.getElementById("complete-btn").addEventListener("click", () => {});
    });

    const gradeBtn = document.getElementById("grade-btn");
    if (gradeBtn) {
      gradeBtn.addEventListener("click", () => gradeQuiz(lesson));
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function gradeQuiz(lesson) {
    let correct = 0;
    lesson.quiz.forEach((q, qi) => {
      const chosen = document.querySelector(`input[name="q${qi}"]:checked`);
      const fb = document.getElementById(`fb-${qi}`);
      const labels = document.querySelectorAll(`.q[data-qi="${qi}"] label`);
      labels.forEach((l) => l.classList.remove("correct", "incorrect"));
      if (!chosen) {
        fb.textContent = "답을 선택한 뒤 확인해 보세요.";
        fb.classList.add("show");
        return;
      }
      const chosenIdx = Number(chosen.value);
      const correctLabel = document.querySelector(`.q[data-qi="${qi}"] label[data-oi="${q.correct}"]`);
      correctLabel.classList.add("correct");
      if (chosenIdx === q.correct) {
        correct++;
        fb.innerHTML = `<strong style="color: var(--ok);">정답입니다.</strong> ${q.explain}`;
      } else {
        const chosenLabel = document.querySelector(`.q[data-qi="${qi}"] label[data-oi="${chosenIdx}"]`);
        chosenLabel.classList.add("incorrect");
        fb.innerHTML = `<strong style="color: var(--accent);">아쉽네요.</strong> ${q.explain}`;
      }
      fb.classList.add("show");
    });
    const total = lesson.quiz.length;
    const justCompleted = correct === total && !isComplete(lesson.id);

    if (justCompleted) {
      markComplete(lesson.id);
      renderSidebar(lesson.id);
      const btn = document.getElementById("complete-btn");
      if (btn) {
        btn.outerHTML = `<button class="btn btn-ghost" id="complete-btn">완료됨 ✓</button>`;
      }
    }

    document.getElementById("grade-result").textContent = justCompleted
      ? `점수: ${correct} / ${total} · 완료로 표시되었습니다`
      : `점수: ${correct} / ${total}`;
  }

  function renderCertificate() {
    const unlocked = allComplete();
    const remaining = totalLessonCount() - completedCount();
    const savedName = localStorage.getItem(NAME_KEY) || "";
    const certIdx = ALL_LESSONS.findIndex((l) => l.id === "certificate");
    const prevLesson = ALL_LESSONS[certIdx - 1];

    pane.innerHTML = `
      <div class="crumb">수료증</div>
      <h1>수료증</h1>
      ${
        unlocked
          ? `
            <p>축하합니다 — Claude 101을 모두 마치셨습니다. 이름을 입력해 수료증을 개인화해 보세요.</p>
            <div class="row" style="margin: 1rem 0 0;">
              <input id="cert-name" type="text" placeholder="이름" value="${escapeAttr(savedName)}"
                style="padding: 0.7rem 0.9rem; font-size: 1rem; border-radius: 8px; border: 1px solid var(--rule); background: var(--bg-elev); min-width: 240px; font-family: inherit;" />
              <button class="btn btn-primary" id="save-name">수료증 업데이트</button>
              <button class="btn btn-ghost" id="print-cert">인쇄 / PDF로 저장</button>
            </div>
            <div class="cert" id="cert">
              <div class="seal">✦</div>
              <div class="meta-line">아래의 분이</div>
              <div class="recipient" id="recipient">${escapeHtml(savedName || "이름을 입력하세요")}</div>
              <div class="meta-line">다음 강의를 성공적으로 수료하였음을 증명합니다</div>
              <h1 style="margin: 0.5rem 0 0.25rem;">Claude 101</h1>
              <div class="meta-line">${new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
          `
          : `
            <p>모든 레슨을 완료하면 수료증이 잠금 해제됩니다. 남은 레슨: <strong>${remaining}개</strong>.</p>
            <div class="cert locked">
              <div class="seal">✦</div>
              <div class="meta-line">아래의 분이</div>
              <div class="recipient">— 잠금 상태 —</div>
              <div class="meta-line">다음 강의를 성공적으로 수료하였음을 증명합니다</div>
              <h1 style="margin: 0.5rem 0 0.25rem;">Claude 101</h1>
            </div>
          `
      }
      <div class="lesson-footer">
        <button class="btn btn-ghost" id="prev-btn">← ${escapeHtml(prevLesson.title)}</button>
        <button class="btn ${isComplete("certificate") ? "btn-ghost" : "btn-primary"}" id="complete-btn">
          ${isComplete("certificate") ? "완료됨 ✓" : "완료로 표시"}
        </button>
      </div>
    `;

    document.getElementById("prev-btn").addEventListener("click", () => navigateTo(prevLesson.id));
    document.getElementById("complete-btn").addEventListener("click", () => {
      markComplete("certificate");
      renderSidebar("certificate");
      renderCertificate();
    });

    if (unlocked) {
      document.getElementById("save-name").addEventListener("click", () => {
        const name = document.getElementById("cert-name").value.trim();
        localStorage.setItem(NAME_KEY, name);
        document.getElementById("recipient").textContent = name || "Your name";
      });
      document.getElementById("print-cert").addEventListener("click", () => window.print());
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function navigateTo(id) {
    location.hash = id;
    renderSidebar(id);
    renderLesson(id);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---- Reset progress ----
  document.getElementById("reset-progress").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("모든 레슨 진행 상황을 초기화하시겠어요?")) {
      progress = {};
      saveProgress(progress);
      const id = location.hash.slice(1) || ALL_LESSONS[0].id;
      renderSidebar(id);
      renderLesson(id);
    }
  });

  // ---- Boot ----
  const initialId =
    (location.hash.slice(1) && ALL_LESSONS.find((l) => l.id === location.hash.slice(1)))
      ? location.hash.slice(1)
      : ALL_LESSONS[0].id;

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (id && ALL_LESSONS.find((l) => l.id === id)) {
      renderSidebar(id);
      renderLesson(id);
    }
  });

  renderSidebar(initialId);
  renderLesson(initialId);
})();
