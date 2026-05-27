// Renders the curriculum card on the landing page from CURRICULUM data.
(function () {
  const card = document.getElementById("curriculum-card");
  if (!card || !window.CURRICULUM) return;

  const frag = document.createDocumentFragment();
  window.CURRICULUM.forEach((section) => {
    const h = document.createElement("div");
    h.className = "section-title";
    h.textContent = section.section;
    frag.appendChild(h);

    const ul = document.createElement("ul");
    section.lessons.forEach((lesson) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `course.html#${lesson.id}`;
      a.innerHTML = `<span class="play">▶</span><span>${lesson.title}</span>`;
      li.appendChild(a);
      ul.appendChild(li);
    });
    frag.appendChild(ul);
  });
  card.appendChild(frag);
})();
