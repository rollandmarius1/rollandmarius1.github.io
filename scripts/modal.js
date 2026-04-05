/* Ajoute les événements souris sur chaque carte.
   - container : l'élément HTML qui contient les cartes
   - data : objet avec les données par type { journal: [...], conf: [...], preprint: [...] } */
function activateCards(container, data) {
  container.querySelectorAll('.card-item').forEach(card => {
    /* Au clic (appui) : effet visuel sur la carte */
    card.addEventListener('mousedown', () => {
      card.classList.add('active');
    });
    /* Au relâchement : retire l'effet et ouvre la popup.
       card.dataset.type et card.dataset.index lisent les attributs
       data-type et data-index qu'on a mis sur chaque carte */
    card.addEventListener('mouseup', () => {
      const type = card.dataset.type;
      const index = card.dataset.index;
      /* Les volets restent fermés (on ne retire pas active).
         On attend que la fermeture des volets soit terminée,
         puis on ouvre la popup */
      card.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'width') {
          openModal(data[type], type, index);
        }
      }, { once: true });
    });
  });
}

/* Crée la structure HTML de la popup et l'ajoute à la page.
   La popup est cachée par défaut (visibility: hidden en CSS).
   Le tableau modal-content est vide, il sera rempli au clic sur une carte. */
function createModal() {
  const html = `
    <div id="modal-container">          <!-- conteneur global, couvre tout l'écran -->
      <div id="modal-overlay"></div>     <!-- Q' : fond semi-transparent + flou -->
      <div id="modal">                  <!-- P' : la fenêtre popup -->
        <button id="modal-close">X</button>
        <div id="modal-body">              <!-- zone scrollable -->
          <table id="modal-content"></table>  <!-- tableau rempli dynamiquement -->
          <div id="modal-buttons">
            <button class="btn-bibtex">BibTeX</button>
            <button class="btn-pdf">PDF</button>
          </div>
        </div>
      </div>
    </div>
  `;
  /* Ajoute au body pour que position: fixed
     couvre bien tout l'écran, indépendamment du layout de la page */
  document.body.insertAdjacentHTML('beforeend', html);
}

/* Ajoute l'événement de fermeture sur le bouton X.
   Au relâchement du clic, retire la classe active du conteneur,
   ce qui cache la popup */
function setupModalClose() {
  document.getElementById('modal-close').addEventListener('mouseup', () => {
    document.getElementById('modal-container').classList.remove('active');
    /* Petit délai pour que la popup disparaisse avant de rouvrir les volets */
    setTimeout(() => {
      document.querySelectorAll('.card-item.active').forEach(c => c.classList.remove('active'));
    }, 80);
  });
}

/* Génère une clé BibTeX à partir du premier auteur et de l'année.
   Ex: "Dupont, Jean and Martin, Paul" + 2024 → "Dupont2024" */
function generateBibtexKey(authors, year) {
  const firstAuthor = authors.split(',')[0].trim().split(' ')[0];
  return firstAuthor + year;
}

/* Génère une entrée BibTeX à partir des données d'une publication.
   - item : l'objet publication du JSON
   - type : "journal", "conf" ou "preprint" → détermine le type BibTeX */
function generateBibtex(item, type) {
  const bibtexType = { journal: 'article', conf: 'inproceedings', preprint: 'misc', book: 'book', phd: 'phdthesis' };
  const key = generateBibtexKey(item.authors, item.year);

  let bib = `@${bibtexType[type]}{${key},\n`;
  bib += `  title     = {${item.title}},\n`;
  bib += `  author    = {${item.authors}},\n`;
  if (item.journal)        bib += `  journal   = {${item.journal}},\n`;
  if (item.booktitle)      bib += `  booktitle = {${item.booktitle}},\n`;
  if (item.series)         bib += `  series    = {${item.series}},\n`;
  if (item.school)         bib += `  school    = {${item.school}},\n`;
  if (item.archiveprefix)  bib += `  archivePrefix = {${item.archiveprefix}},\n`;
  if (item.eprint)         bib += `  eprint    = {${item.eprint}},\n`;
  bib += `  year      = {${item.year}},\n`;
  if (item.volume)    bib += `  volume    = {${item.volume}},\n`;
  if (item.pages)     bib += `  pages     = {${item.pages}},\n`;
  if (item.publisher) bib += `  publisher = {${item.publisher}},\n`;
  if (item.doi)       bib += `  doi       = {${item.doi}},\n`;
  bib += `}`;
  return bib;
}

/* Crée la popup BibTeX et l'ajoute à la page */
function createBibtexModal() {
  const html = `
    <div id="bibtex-container">
      <div id="bibtex-overlay"></div>
      <div id="bibtex-modal">
        <button id="bibtex-close">X</button>
        <pre id="bibtex-content"></pre>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);

  /* Ferme la popup BibTeX au clic sur l'overlay ou le bouton X */
  document.getElementById('bibtex-overlay').addEventListener('click', () => {
    document.getElementById('bibtex-container').classList.remove('active');
  });
  document.getElementById('bibtex-close').addEventListener('mouseup', () => {
    document.getElementById('bibtex-container').classList.remove('active');
  });
}

/* Ouvre la popup BibTeX avec le contenu généré */
function openBibtexModal(item, type) {
  const bibtex = generateBibtex(item, type);
  document.getElementById('bibtex-content').textContent = bibtex;
  document.getElementById('bibtex-modal').className = 'modal-' + type;
  document.getElementById('bibtex-container').classList.add('active');
}

/* Remplit la popup avec les données d'une publication et l'affiche.
   - data : le tableau de publications du bon type (ex: data.journals)
   - type : "journal", "conf" ou "preprint"
   - index : la position de la publication dans le tableau */
function openModal(data, type, index) {
  const item = data[index];
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  /* Remplit le tableau avec les infos de la publication.
     Chaque <tr> est une ligne : colonne gauche = label, colonne droite = valeur.
     On n'affiche que les champs non vides, adaptés au type. */
  let rows = '';
  const add = (label, value) => { if (value) rows += `<tr><td>${label}</td><td>${value}</td></tr>`; };

  add('Titre', item.title);
  add('Auteurs', item.authors);
  add('Revue', item.journal);
  add('Conférence', item.booktitle);
  add('Série', item.series);
  add('Archive', item.archiveprefix);
  add('eprint', item.eprint);
  add('École', item.school);
  add('Année', item.year);
  add('Volume', item.volume);
  add('Pages', item.pages);
  add('Éditeur', item.publisher);
  add('DOI', item.doi);
  add('Abstract', item.abstract);

  content.innerHTML = rows;

  /* Change la classe du modal pour que la bordure colorée
     corresponde au type (journal = bleu, conf = vert, preprint = rose) */
  modal.className = 'modal-' + type;

  /* Connecte le bouton BibTeX à la publication courante */
  const btnBibtex = document.querySelector('.btn-bibtex');
  btnBibtex.onclick = () => openBibtexModal(item, type);

  /* Connecte le bouton PDF : ouvre le lien dans un nouvel onglet.
     Cache le bouton si aucun lien PDF n'est disponible */
  const btnPdf = document.querySelector('.btn-pdf');
  if (item.pdf) {
    btnPdf.style.display = '';
    btnPdf.onclick = () => window.open(item.pdf, '_blank');
  } else {
    btnPdf.style.display = 'none';
  }

  /* Affiche la popup en ajoutant la classe active sur le conteneur */
  document.getElementById('modal-container').classList.add('active');
}
