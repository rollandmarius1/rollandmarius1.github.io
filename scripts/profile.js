async function loadProfile() {
    loadMenu("index");
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
}
