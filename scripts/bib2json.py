"""
Convertit un fichier .bib en publications.json pour le site web.

Usage : python3 bib2json.py biblio.bib data/publications.json

Nécessite pandoc, qui interprète le LaTeX des champs : la mise en forme
devient du HTML (\\emph{x} → <em>x</em>) et les formules du MathML, que les
navigateurs rendent nativement. Aucune bibliothèque n'est donc chargée chez
le visiteur.

    sudo apt-get install -y pandoc

Types BibTeX → catégories JSON :
  @article        → journals
  @inproceedings  → conferences
  @misc           → preprints
  @book           → books
  @phdthesis      → phd
"""

import re
import sys
import json
import shutil
import subprocess
import unicodedata
import bibtexparser


# Mapping type BibTeX → catégorie JSON
TYPE_MAP = {
    'article':        'journals',
    'inproceedings':  'conferences',
    'misc':           'preprints',
    'book':           'books',
    'phdthesis':      'phd',
}

# Macros du manuscrit. Pandoc ne peut pas les deviner : elles viennent du
# préambule de la thèse, c'est donc ici qu'il faut déclarer les nouvelles.
# \P désigne déjà le pied-de-mouche ¶ en LaTeX, d'où le \renewcommand.
#
# Ces définitions n'ont de sens qu'en mode mathématique : dans le .bib il
# faut donc écrire $\NP$ et non {\NP}, sinon \mathsf s'applique hors maths
# et le nom de la classe disparaît sans aucune erreur.
MACROS = (
    r"\newcommand{\NP}{\mathsf{NP}}"
    r"\newcommand{\NPC}{\mathsf{NPC}}"
    r"\newcommand{\PSPACE}{\mathsf{PSPACE}}"
    r"\renewcommand{\P}{\mathsf{P}}"
)

# Champs retirés du BibTeX proposé au visiteur. Le résumé est déjà affiché
# juste au-dessus et rendrait l'entrée interminable à copier.
BIBTEX_SKIP = ('abstract',)

# <span> sans attribut : ce que pandoc produit pour un groupe comme {\c c}
EMPTY_SPAN = re.compile(r'<span>([^<]*)</span>')

# En-tête d'une entrée, en début de ligne : @phdthesis{mathese,
ENTRY_HEADER = re.compile(r'^(@\w+\s*\{\s*)([^,\s]+)', re.MULTILINE)

# Mémoïsation : un même champ n'est converti qu'une fois
_converted = {}


def require_pandoc():
    """Vérifie la présence de pandoc avant de commencer."""
    if shutil.which('pandoc') is None:
        sys.exit("Erreur : pandoc est introuvable, il interprète le LaTeX "
                 "des champs.\nInstallation : sudo apt-get install -y pandoc")


def pandoc(text, to_format, *extra):
    """Convertit du LaTeX avec pandoc, les macros du manuscrit en préambule."""
    key = (text, to_format, extra)
    if key in _converted:
        return _converted[key]

    command = ['pandoc', '-f', 'latex', '-t', to_format, '--wrap=none', *extra]
    try:
        result = subprocess.run(command, input=MACROS + text,
                                capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as error:
        sys.exit(f"Erreur pandoc sur ce champ :\n{text[:200]}\n{error.stderr}")

    _converted[key] = result.stdout.strip()
    return _converted[key]


def html_field(entry, key, default=""):
    """Champ converti en HTML : mise en forme réelle, formules en MathML."""
    source = entry.get(key, default)
    if not source.strip():
        return ""
    return EMPTY_SPAN.sub(r'\1', pandoc(source, 'html', '--math-method=mathml'))


def inline_field(entry, key, default=""):
    """Comme html_field, sans l'enveloppe <p> des champs d'une seule ligne."""
    html = html_field(entry, key, default)
    if html.count('<p>') == 1 and html.startswith('<p>') and html.endswith('</p>'):
        return html[len('<p>'):-len('</p>')].strip()
    return html


def text_field(entry, key, default=""):
    """Champ converti en texte sans balise : les noms d'auteurs."""
    source = entry.get(key, default)
    if not source.strip():
        return ""
    return pandoc(source, 'plain')


def raw_field(entry, key, default="", dashes=False):
    """Champ laissé tel quel : identifiants et nombres (DOI, URL, pages).

    Ces champs ne contiennent pas de LaTeX à interpréter, et les passer à
    pandoc risquerait d'abîmer un souligné de DOI ou un tiret d'URL.
    """
    text = entry.get(key, default).replace("{", "").replace("}", "")
    if dashes:
        text = text.replace("---", "—").replace("--", "–")
    return " ".join(text.split()).strip()


def parse_authors(entry):
    """Découpe le champ author en liste de {"nom": ..., "prenom": ...}.

    Auteurs séparés par " and ", chacun écrit "Nom, Prénom".
    """
    authors = []
    for name in text_field(entry, 'author').split(' and '):
        nom, _, prenom = name.partition(',')
        authors.append({"nom": nom.strip(), "prenom": prenom.strip()})
    return authors


def matching_brace(text, start):
    """Position de l'accolade fermant celle qui se trouve en `start`."""
    depth = 0
    for position in range(start, len(text)):
        if text[position] == '{':
            depth += 1
        elif text[position] == '}':
            depth -= 1
            if depth == 0:
                return position
    return len(text) - 1


def strip_fields(entry_text, fields):
    """Retire des champs d'une entrée BibTeX brute, accolades comprises."""
    for field in fields:
        found = re.search(r'\n[ \t]*' + field + r'[ \t]*=[ \t]*\{',
                          entry_text, re.IGNORECASE)
        if not found:
            continue
        end = matching_brace(entry_text, found.end() - 1) + 1
        # Emporte la virgule qui terminait le champ
        while end < len(entry_text) and entry_text[end] in ' \t':
            end += 1
        if end < len(entry_text) and entry_text[end] == ',':
            end += 1
        entry_text = entry_text[:found.start()] + entry_text[end:]
    return entry_text


def extract_raw_entries(bib_path):
    """Associe chaque clé BibTeX au texte brut de son entrée.

    Le BibTeX montré au visiteur est ainsi exactement celui du fichier
    source : protection de casse et champs annexes sont préservés, au lieu
    d'être reconstruits de mémoire côté navigateur.
    """
    with open(bib_path, encoding='utf-8') as f:
        source = f.read()

    raw = {}
    for header in ENTRY_HEADER.finditer(source):
        opening = source.index('{', header.start())
        closing = matching_brace(source, opening)
        raw[header.group(2)] = strip_fields(source[header.start():closing + 1],
                                            BIBTEX_SKIP)
    return raw


def article_to_pub(entry):
    """@article → journals"""
    pub = {
        "title":     inline_field(entry, 'title'),
        "authors":   parse_authors(entry),
        "journal":   inline_field(entry, 'journal'),
        "year":      int(raw_field(entry, 'year', '0')),
        "volume":    raw_field(entry, 'volume'),
        "pages":     raw_field(entry, 'pages', dashes=True),
        "publisher": inline_field(entry, 'publisher'),
        "doi":       raw_field(entry, 'doi'),
        "abstract":  html_field(entry, 'abstract'),
    }
    url = raw_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def inproceedings_to_pub(entry):
    """@inproceedings → conferences"""
    pub = {
        "title":     inline_field(entry, 'title'),
        "authors":   parse_authors(entry),
        "booktitle": inline_field(entry, 'booktitle'),
        "series":    inline_field(entry, 'series'),
        "year":      int(raw_field(entry, 'year', '0')),
        "pages":     raw_field(entry, 'pages', dashes=True),
        "publisher": inline_field(entry, 'publisher'),
        "doi":       raw_field(entry, 'doi'),
        "abstract":  html_field(entry, 'abstract'),
    }
    url = raw_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def misc_to_pub(entry):
    """@misc → preprints"""
    pub = {
        "title":         inline_field(entry, 'title'),
        "authors":       parse_authors(entry),
        "archiveprefix": raw_field(entry, 'archiveprefix'),
        "eprint":        raw_field(entry, 'eprint'),
        "year":          int(raw_field(entry, 'year', '0')),
        "doi":           raw_field(entry, 'doi'),
        "abstract":      html_field(entry, 'abstract'),
    }
    url = raw_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def book_to_pub(entry):
    """@book → books"""
    pub = {
        "title":     inline_field(entry, 'title'),
        "authors":   parse_authors(entry),
        "publisher": inline_field(entry, 'publisher'),
        "series":    inline_field(entry, 'series'),
        "year":      int(raw_field(entry, 'year', '0')),
        "pages":     raw_field(entry, 'pages', dashes=True),
        "doi":       raw_field(entry, 'doi'),
        "abstract":  html_field(entry, 'abstract'),
    }
    url = raw_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def phdthesis_to_pub(entry):
    """@phdthesis → phd"""
    pub = {
        "title":    inline_field(entry, 'title'),
        "authors":  parse_authors(entry),
        "school":   inline_field(entry, 'school'),
        "year":     int(raw_field(entry, 'year', '0')),
        "doi":      raw_field(entry, 'doi'),
        "abstract": html_field(entry, 'abstract'),
    }
    url = raw_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def base_key(pub):
    """Clé BibTeX : nom du premier auteur, sans accent, + année."""
    nom = unicodedata.normalize('NFD', pub['authors'][0]['nom'])
    nom = ''.join(c for c in nom if c.isascii() and c.isalpha())
    return nom + str(pub['year'])


def assign_bibkeys(result):
    """Ajoute le champ bibkey à chaque publication.

    Suffixe a, b, c... quand plusieurs publications partagent la même
    clé de base ; pas de suffixe si elle est unique. L'entrée BibTeX brute
    porte la clé du fichier source : on y substitue la clé affichée.
    """
    pubs = [p for category in result.values() for p in category]

    total = {}
    for p in pubs:
        total[base_key(p)] = total.get(base_key(p), 0) + 1

    rank = {}
    for p in pubs:
        base = base_key(p)
        if total[base] == 1:
            p['bibkey'] = base
        else:
            p['bibkey'] = base + chr(ord('a') + rank.get(base, 0))
            rank[base] = rank.get(base, 0) + 1

        if p['bibtex']:
            p['bibtex'] = ENTRY_HEADER.sub(r'\g<1>' + p['bibkey'],
                                           p['bibtex'], count=1)


# Mapping type BibTeX → fonction de conversion
CONVERT_MAP = {
    'article':        article_to_pub,
    'inproceedings':  inproceedings_to_pub,
    'misc':           misc_to_pub,
    'book':           book_to_pub,
    'phdthesis':      phdthesis_to_pub,
}


def bib_to_json(bib_path, json_path):
    """Lit un fichier .bib et produit le publications.json."""
    require_pandoc()

    with open(bib_path, encoding='utf-8') as f:
        parser = bibtexparser.bparser.BibTexParser(common_strings=True)
        library = bibtexparser.load(f, parser=parser)

    raw_entries = extract_raw_entries(bib_path)

    # Initialise les catégories
    result = {
        "books":       [],
        "journals":    [],
        "conferences": [],
        "preprints":   [],
        "phd":         [],
    }

    for entry in library.entries:
        entry_type = entry.get('ENTRYTYPE', '').lower()
        category = TYPE_MAP.get(entry_type)
        convert = CONVERT_MAP.get(entry_type)
        if category is None or convert is None:
            continue
        pub = convert(entry)
        pub['bibtex'] = raw_entries.get(entry['ID'], '')
        result[category].append(pub)

    # Trie chaque catégorie par année décroissante
    for key in result:
        result[key].sort(key=lambda p: p['year'], reverse=True)

    assign_bibkeys(result)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Conversion terminée : {len(library.entries)} entrées lues")
    for key, items in result.items():
        if items:
            print(f"  {key}: {len(items)}")


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage : python3 bib2json.py <fichier.bib> <sortie.json>")
        sys.exit(1)
    bib_to_json(sys.argv[1], sys.argv[2])
