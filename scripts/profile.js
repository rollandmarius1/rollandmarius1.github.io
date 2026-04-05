async function loadProfile() {
  loadMenu("index");
  const data = await fetch(dataPath + "profile.json").then(r => r.json());

  /* Génère les liens (n'affiche que ceux qui ont une URL) */
  const links = data.links
    .filter(l => l.url)
    .map(l => `<a href="${l.url}" target="_blank">${l.label}</a>`)
    .join('');

  document.getElementById("profile").innerHTML = `
    <section class="profile-section">
      <div class="profile-header">
        <img class="profile-photo" src="${data.photo}" alt="Photo de ${data.name}">
        <div class="profile-info">
          <h1>${data.name}</h1>
          <p class="profile-title">${data.title}</p>
          <p class="profile-affiliation">${data.affiliation}</p>
        </div>
      </div>

      <div class="profile-content">
        <h2>À propos</h2>
        <p>${data.bio}</p>

        <h2>Contact</h2>
        <div class="contact-info">
          <p><span class="copy-email" title="Copier l'adresse email" style="cursor:pointer" onclick="navigator.clipboard.writeText('${data.email}')">📧</span> <strong>Email :</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        </div>

        ${links ? `<h2>Liens</h2><div class="links-list">${links}</div>` : ''}
      </div>
    </section>`;
}
