function loadMenu() {
document.getElementById("menu").innerHTML = `
<a href="index.html">Accueil</a>
<a href="cv.html">CV</a>
<a href="teaching.html">Enseignements</a>
<a href="publications.html">Publications</a>`;
}


async function loadProfile() {
loadMenu();
const data = await fetch("data/profile.json").then(r => r.json());
document.getElementById("profile").innerHTML = `
<h1>${data.name}</h1>
<img src="${data.photo}" class="photo">
<p>${data.bio}</p>
<p>${data.contact.email}</p>`;
}






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
  loadMenu();
  const container = document.getElementById("content");
  const data = await fetch("data/cv.json").then(r => r.json());

  container.innerHTML = `
    <h1>Curriculum Vitae</h1>
    ${renderCVSection("Formation", data.education)}
    ${renderCVSection("Expérience professionnelle", data.experience)}
  `;
}






async function loadTeaching() {
  loadMenu();
  const container = document.getElementById("content");
  const data = await fetch("data/teaching.json").then(r => r.json());

  let html = "<h1>Enseignements</h1>";

  for (const year in data) {
    html += `<h2>${year}</h2>`;
    data[year].forEach(c => {
      html += `
        <div class="teaching-item">
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







function renderPublications(title, list) {
  let html = `<h2>${title}</h2>`;
  list.forEach(p => {
    html += `
        <div class="publication-item">
            <div class="title">${p.title}</div>
            <div class="authors"> ${p.authors}</div>
            <div class="journal"> ${p.journal}</div>
            <div class="year">${p.year}</div>
            <a href=${p.pdf} class="pdf-link">📄 PDF</a>
        </div>
    `;
  });
  return html;
}

async function loadPublications() {
  loadMenu();
  const container = document.getElementById("content");
  const data = await fetch("data/publications.json").then(r => r.json());

  container.innerHTML = `
    <h1>Publications</h1>
    ${renderPublications("Preprints", data.preprints)}
    ${renderPublications("Revues", data.journals)}
    ${renderPublications("Conférences", data.conferences)}
  `;
}

