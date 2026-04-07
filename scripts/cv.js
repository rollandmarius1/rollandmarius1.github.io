/* Génère le HTML d'une section du CV (h3 + cartes) */
function renderCVSection(sectionId, title, items) {
  if (!items || items.length === 0) return '';
  let html = `<h3 class="${sectionId}">${title}</h3>`;
  items.forEach(item => {
    html += `
      <div class="card-item ${sectionId}-item">
        <h4>${item.title}</h4>
        <div class="period">${item.period}</div>
        ${item.institution ? `<div class="institution">${item.institution}</div>` : ''}
        ${item.description ? `<div class="description">${item.description}</div>` : ''}
      </div>
    `;
  });
  return html;
}

async function loadCV() {
  loadMenu("cv");
  const container = document.getElementById("content");

  /* Charge l'index des sections groupées par thème */
  const themes = await fetch(dataPath + "cv_sections.json").then(r => r.json());

  let html = '<h1>Curriculum Vitae</h1>';

  /* Pour chaque thème, affiche un h2 puis les sections */
  for (const theme of themes) {
    html += `<h2>${theme.theme}</h2>`;
    for (const section of theme.sections) {
      const items = await fetch(dataPath + section.file).then(r => r.json());
      html += renderCVSection(section.id, section.title, items);
    }
  }

  container.innerHTML = html;

  /* Crée l'overlay */
  document.body.insertAdjacentHTML('beforeend', '<div id="cv-overlay"></div>');
  const overlay = document.getElementById('cv-overlay');

  /* Ajoute le clic sur chaque carte pour l'agrandir */
  container.querySelectorAll('.card-item').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('expanded')) return;
      /* Calcule le décalage pour centrer la carte */
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      const dx = screenCenterX - cardCenterX;
      const dy = screenCenterY - cardCenterY;
      const w = window.innerWidth;
      const scale = w <= 600 ? 1.1 : w >= 1200 ? 1.5 : 1.2;
      card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      card.classList.add('expanded');
      overlay.classList.add('active');
    });
  });

  /* Clic sur l'overlay pour refermer la carte */
  overlay.addEventListener('click', () => {
    container.querySelectorAll('.card-item.expanded').forEach(c => {
      c.style.transform = '';
      c.classList.remove('expanded');
    });
    overlay.classList.remove('active');
  });
}
