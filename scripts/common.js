const htmlPath =  "../html/"
const dataPath = "../data/"

/* Génère le menu de navigation.
   activePage : nom de la page active ("index", "cv", "teaching", "publications")
   pour mettre en évidence le lien correspondant */
function loadMenu(activePage) {
    const links = [
      { href: "index.html",        label: "🏠 Accueil",        page: "index" },
      { href: "cv.html",           label: "📄 CV",             page: "cv" },
      { href: "teaching.html",     label: "👨‍🏫 Enseignements",  page: "teaching" },
      { href: "publications.html", label: "📚 Publications",   page: "publications" }
    ];
    document.getElementById("menu").innerHTML = links.map(l =>
      `<a href="${htmlPath}${l.href}" class="${l.page === activePage ? 'active' : ''}">${l.label}</a>`
    ).join('');
}
