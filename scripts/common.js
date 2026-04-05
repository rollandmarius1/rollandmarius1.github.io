const htmlPath =  "../html/"
const dataPath = "../data/"

/* Génère le menu de navigation.
   activePage : nom de la page active ("index", "cv", "teaching", "publications")
   pour mettre en évidence le lien correspondant */
function loadMenu(activePage) {
    const links = [
      { href: "index.html",        icon: "🏠", label: "Accueil",        page: "index" },
      { href: "cv.html",           icon: "📄", label: "CV",             page: "cv" },
      { href: "teaching.html",     icon: "👨‍🏫", label: "Enseignements",  page: "teaching" },
      { href: "publications.html", icon: "📚", label: "Publications",   page: "publications" }
    ];
    document.getElementById("menu").innerHTML = links.map(l =>
      `<a href="${htmlPath}${l.href}" class="${l.page === activePage ? 'active' : ''}"><span class="menu-icon">${l.icon}</span><br>${l.label}</a>`
    ).join('');
}
