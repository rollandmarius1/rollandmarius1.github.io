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


async function loadCV() {
loadMenu();
const d = await fetch("data/cv.json").then(r => r.json());
document.getElementById("content").innerHTML += renderList("Formation", d.education);
}


async function loadTeaching() {
loadMenu();
const d = await fetch("data/teaching.json").then(r => r.json());
let html = "<h1>Enseignements</h1>";
for (const year in d) {
html += `<h2>${year}</h2><ul>`;
d[year].forEach(c => {
html += `<li>${c.course} (${c.level}) – ${c.hours}h</li>`;
});
html += "</ul>";
}
document.getElementById("content").innerHTML += html;
}


async function loadPublications() {
loadMenu();
const d = await fetch("data/publications.json").then(r => r.json());
let html = "<h1>Publications</h1>";
["preprints","journals","conferences"].forEach(sec => {
html += `<h2>${sec}</h2><ul>`;
d[sec].forEach(p => {
html += `<li><b>${p.title}</b>, ${p.authors}, ${p.venue} (${p.year}) <a href='${p.pdf}'>PDF</a></li>`;
});
html += "</ul>";
});
document.getElementById("content").innerHTML += html;
}
