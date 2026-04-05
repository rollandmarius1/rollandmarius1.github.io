/* Retourne le lieu de publication selon le type */
function getVenue(p, key) {
  if (key === 'journal') return p.journal || '';
  if (key === 'conf')    return p.series || p.booktitle || '';
  if (key === 'preprint') return p.archiveprefix || '';
  if (key === 'book')    return p.publisher || '';
  if (key === 'phd')     return p.school || '';
  return '';
}

function renderPublications(title, key, list) {
  /* N'affiche rien si la liste est vide */
  if (!list || list.length === 0) return '';
  let html = `<h2 class=${key}> ${title}</h2>`;
  list.forEach((p, i) => {
    html += `
        <div class="card-item ${key}-item" data-type="${key}" data-index="${i}">
            <h3>${p.title}</h3>
            <div class="authors">${p.authors}</div>
            <div class="venue">${getVenue(p, key)}</div>
            <div class="year">${p.year}</div>
        </div>
    `;
  });
  return html;
}

async function loadPublications() {
  loadMenu("publications");
  const container = document.getElementById("content");
  const data = await fetch(dataPath+"publications.json").then(r => r.json());

  container.innerHTML = `
    <h1>Publications</h1>` +
    renderPublications("Livres", "book", data.books) +
    renderPublications("Revues", "journal", data.journals) +
    renderPublications("Conférences", "conf", data.conferences) +
    renderPublications("Preprints", "preprint", data.preprints) +
    renderPublications("Thèse", "phd", data.phd)
  ;
  /* Objet qui associe chaque type à son tableau de données.
     Permet à activateCards de retrouver la bonne publication au clic */
  const pubData = {
    book: data.books,
    journal: data.journals,
    conf: data.conferences,
    preprint: data.preprints,
    phd: data.phd
  };
  createModal();
  createBibtexModal();
  setupModalClose();
  activateCards(container, pubData);
}
