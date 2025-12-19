function loadMenu() {
    document.getElementById("menu").innerHTML = `
    <a href="index.html">🏠 Accueil</a>
    <a href="cv.html">📄 CV<</a>
    <a href="teaching.html">👨‍🏫 Enseignements</a>
    <a href="publications.html">📚 Publications</a>`;
}


async function loadProfile() {
    loadMenu();
    document.getElementById("profile").innerHTML = `
     <section class="profile-section">
                    <div class="profile-header">
                        <div class="profile-photo"></div>
                        <div class="profile-info">
                            <h1>Dr. Prénom Nom</h1>
                            <p class="profile-title">Doctorant</p>
                            <p class="profile-affiliation">CNRS, LIS, Marseille</p>
                        </div>
                    </div>

                    <div class="profile-content">
                        <h2>À propos</h2>
                        <p>Je suis chercheur en informatique .</p>

                        <h2>Coordonnées</h2>
                        <div class="contact-info">
                            <p><strong>📧 Email:</strong> prenom.nom@univ-paris.fr</p>
                            <p><strong>📞 Téléphone:</strong> +33 1 23 45 67 89</p>
                            <p><strong>🏢 Bureau:</strong> Bâtiment A, Bureau 305</p>
                            <p><strong>📍 Adresse:</strong> Département Informatique, Aix-Marseille Université</p>
                        </div>

                        <h2>Liens</h2>
                        <div class="links-list">
                            <a href="#" target="_blank">Google Scholar</a>
                            <a href="#" target="_blank">ORCID</a>
                            <a href="#" target="_blank">GitHub</a>
                            <a href="#" target="_blank">LinkedIn</a>
                            <a href="#" target="_blank">HAL</a>
                        </div>
                    </div>
                </section>`
    
    
    /*const data = await fetch("data/profile.json").then(r => r.json());
    document.getElementById("profile").innerHTML = `
    <h1>${data.name}</h1>
    <img src="${data.photo}" class="photo">
    <p>${data.bio}</p>
    <p>${data.contact.email}</p>`; */
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
    
    
    container.innerHTML = `<h1>Curriculum Vitae</h1>

                <section class="cv-section">
                    <h2>Formation</h2>
                    <div class="cv-item">
                        <h3>Doctorat en Informatique</h3>
                        <div class="period">2023 - 2026</div>
                        <div class="institution">CNRS, Aix-Marseille Université</div>
                        <div class="description">TODO</div>
                    </div>
                    <div class="cv-item">
                        <h3>Master Informatique </h3>
                        <div class="period">2021 - 2023</div>
                        <div class="institution">Aix-Marseille Université</div>
                        <div class="description">Parcours Informatiques et Mathématique Discretes, Mention très bien.</div>
                    </div>
                </section>

                <section class="cv-section">
                    <h2>Expérience Professionnelle</h2>
                    <div class="cv-item">
                        <h3>TODO</h3>
                        <div class="period">TODO</div>
                        <div class="institution">TODO</div>
                        <div class="description">TODO</div>
                    </div>
                    <div class="cv-item">
                        <h3>Post-doctorant</h3>
                        <div class="period">TODO</div>
                        <div class="institution">TODO</div>
                        <div class="description">TODO.</div>
                    </div>
                </section>

                <section class="cv-section">
                    <h2>Compétences</h2>
                    <div class="skills-grid">
                        <div class="skill-category">
                            <h3>Programmation</h3>
                            <ul>
                                <li>Python</li>
                                <li>Java</li>
                                <li>C/C++</li>
                                <li>JavaScript</li>
                            </ul>
                        </div>
                     
                        <div class="skill-category">
                            <h3>Outils</h3>
                            <ul>
                                <li>Git / GitHub</li>
                                <li>LaTeX</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="cv-section">
                    <h2>Langues</h2>
                    <div class="languages-list">
                        <div class="language-item">
                            <h3>Français</h3>
                            <div class="level">Langue maternelle</div>
                        </div>
                        <div class="language-item">
                            <h3>Anglais</h3>
                            <div class="level">Intermédiaire (B1)</div>
                        </div>
                    </div>
                </section>`
    /*`
    <h1>Curriculum Vitae</h1>
    ${renderCVSection("Formation", data.education)}
    ${renderCVSection("Expérience professionnelle", data.experience)}
    `;*/
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

