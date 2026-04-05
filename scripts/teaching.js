async function loadTeaching() {
  loadMenu("teaching");
  const container = document.getElementById("content");
  const data = await fetch(dataPath+"teaching.json").then(r => r.json());

  let html = "<h1>Enseignements</h1>";

  for (const year in data) {
    html += `<h2>${year}</h2>`;
    data[year].forEach(c => {
      html += `
        <div class="card-item teaching-item">
          <h3>${c.course}</h3>
          <div class="teaching-meta">
                <span><strong>Niveau:</strong> ${c.level}3</span>
                <span><strong>Volume:</strong> ${c.hours}</span>
            </div>
            <div class="description">${c.description}</div>
        </div>
      `;
    });
  }
  container.innerHTML = html;
}
