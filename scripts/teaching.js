async function loadTeaching() {
  loadMenu("teaching");
  const container = document.getElementById("content");
  const data = await fetch(dataPath+"teaching.json").then(r => r.json());

  let html = "<h1>Enseignements</h1>";

  /* Tri des années du plus récent au plus ancien */
  const years = Object.keys(data).sort((a, b) => b - a);
  for (const year of years) {
    html += `<h2>${year}</h2>`;
    data[year].forEach((c, i) => {
      html += `
        <div class="card-item ${c.type}-item" data-year="${year}" data-index="${i}" data-type="${c.type}">
          <h3>${c.course}</h3>
          <div class="teaching-meta">
                <span><strong>Niveau:</strong> ${c.level}</span>
                <span><strong>Volume:</strong> ${c.hours}</span>
            </div>
            <div class="description">${c.description}</div>
        </div>
      `;
    });
  }
  container.innerHTML = html;
  createTeachingModal();
  setupTeachingModalClose();
  activateTeachingCards(container, data);
}
