function renderCVSection(title, items) {
  let html = `<h2>${title}</h2>`;
  items.forEach(item => {
    html += `
      <div class="ticket cv">
        <h3>${item.title}</h3>
        <div class="period">${item.period}</div>
        <div class="institution">${item.institution}</div>
        <div class="description">${item.description}</div>
      </div>
    `;
  });
  return html;
}

async function loadCV() {
    loadMenu("cv");
    const container = document.getElementById("content");
    const data = await fetch(dataPath+"cv.json").then(r => r.json());

    let html = '<h1>Curriculum Vitae</h1>';

    for (const key in data) {
        html += `<section class="cv-section">
                    <h2>${key}</h2>`;
        data[key].forEach(c => {
        html += `
            <div class="card-item cv-item">
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
