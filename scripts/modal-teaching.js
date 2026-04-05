/* Crée la popup enseignements et l'ajoute à la page */
function createTeachingModal() {
  const html = `
    <div id="modal-container">
      <div id="modal-overlay"></div>
      <div id="modal">
        <button id="modal-close">X</button>
        <h3 id="modal-title"></h3>
        <div id="modal-body">
          <div id="modal-content"></div>
          <div id="modal-buttons"></div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

/* Fermeture de la popup au clic sur le bouton X */
function setupTeachingModalClose() {
  document.getElementById('modal-close').addEventListener('mouseup', () => {
    document.getElementById('modal-container').classList.remove('active');
    setTimeout(() => {
      document.querySelectorAll('.card-item.active').forEach(c => {
        c.classList.remove('active');
        c.classList.add('closing');
        setTimeout(() => c.classList.remove('closing'), 525);
      });
    }, 120);
  });
}

/* Construit le chemin vers un fichier pédagogique.
   Ex: ../materiel_pedagogique/2024/Algorithmique Avancée/CM/1.pdf */
function materialPath(year, course, type, num) {
  return `../materiel_pedagogique/${year}/${course}/${type}/${num}.pdf`;
}

/* Crée un bouton avec son sous-menu déroulant */
function createMaterialButton(label, count, year, course, type) {
  let html = `<div class="material-btn-group">
    <button class="btn-material">${label}</button>
    <div class="material-submenu">`;
  for (let i = 1; i <= count; i++) {
    html += `<a href="${materialPath(year, course, type, i)}" target="_blank">${label} ${i}</a>`;
  }
  html += `</div></div>`;
  return html;
}

/* Ouvre la popup avec les infos du cours */
function openTeachingModal(item, type, year, originX, originY) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const buttons = document.getElementById('modal-buttons');

  /* Remplit le titre et le contenu */
  document.getElementById('modal-title').textContent = item.course;
  content.innerHTML = `
    <table>
      <tr><td>Niveau</td><td>${item.level}</td></tr>
      <tr><td>Volume</td><td>${item.hours}</td></tr>
      <tr><td>Description</td><td>${item.description}</td></tr>
    </table>
    <p style="margin-top: 1rem;">${item.details || ''}</p>
  `;

  /* Boutons CM/TD/TP conditionnels avec sous-menu */
  let btns = '';
  if (item.cm > 0) btns += createMaterialButton('CM', item.cm, year, item.course, 'CM');
  if (item.td > 0) btns += createMaterialButton('TD', item.td, year, item.course, 'TD');
  if (item.tp > 0) btns += createMaterialButton('TP', item.tp, year, item.course, 'TP');
  buttons.innerHTML = btns;

  /* Active les sous-menus au clic */
  buttons.querySelectorAll('.btn-material').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = btn.parentElement;
      /* Ferme les autres sous-menus */
      buttons.querySelectorAll('.material-btn-group.open').forEach(g => {
        if (g !== group) g.classList.remove('open');
      });
      group.classList.toggle('open');
      btn.classList.add('active');
    } );
  });

  /* Empêche les clics dans les sous-menus de les fermer */
  buttons.querySelectorAll('.material-submenu').forEach(sub => {
    sub.addEventListener('click', (e) => e.stopPropagation());
  });

  /* Ferme les sous-menus au clic n'importe où en dehors */
  document.addEventListener('click', () => {
    buttons.querySelectorAll('.material-btn-group.open').forEach(g => g.classList.remove('open'));
    buttons.querySelectorAll('.btn-material.active').forEach(b => b.classList.remove('active'));
  });

  /* Classe du type pour la bordure colorée */
  modal.className = 'modal-' + type;

  /* Définit le point de départ de l'animation depuis la carte cliquée */
  if (originX !== undefined && originY !== undefined) {
    const modalW = Math.min(window.innerWidth * 0.85, 700);
    const modalH = window.innerHeight * 0.85;
    const modalLeft = (window.innerWidth - modalW) / 2;
    const modalTop = (window.innerHeight - modalH) / 2;
    const relX = originX - modalLeft;
    const relY = originY - modalTop;
    modal.style.transformOrigin = `${relX}px ${relY}px`;
  }

  document.getElementById('modal-container').classList.add('active');
}

/* Ajoute les événements sur les cartes enseignements */
function activateTeachingCards(container, data) {
  container.querySelectorAll('.card-item').forEach(card => {
    let downTime = 0;

    card.addEventListener('mousedown', () => {
      card.classList.add('active');
      downTime = Date.now();
    });

    card.addEventListener('mouseup', () => {
      const year = card.dataset.year;
      const index = card.dataset.index;
      const type = card.dataset.type;
      const rect = card.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      const elapsed = Date.now() - downTime;
      const remaining = Math.max(0, 300 - elapsed);
      setTimeout(() => {
        openTeachingModal(data[year][index], type, year, originX, originY);
      }, remaining);
    });
  });
}
