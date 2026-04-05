"""
Convertit un fichier .bib en publications.json pour le site web.

Usage : python3 bib2json.py biblio.bib data/publications.json

Types BibTeX → catégories JSON :
  @article        → journals
  @inproceedings  → conferences
  @misc           → preprints
  @book           → books
  @phdthesis      → phd
"""

import sys
import json
import bibtexparser


# Mapping type BibTeX → catégorie JSON
TYPE_MAP = {
    'article':        'journals',
    'inproceedings':  'conferences',
    'misc':           'preprints',
    'book':           'books',
    'phdthesis':      'phd',
}


def clean_latex(text):
    """Retire les commandes LaTeX courantes d'une chaîne."""
    replacements = {
        r"{\`e}": "è", r"{\'e}": "é", r"{\^e}": "ê", r"{\"e}": "ë",
        r"{\`a}": "à", r"{\'a}": "á", r"{\^a}": "â",
        r"{\`u}": "ù", r"{\'u}": "ú", r"{\^u}": "û",
        r"{\^o}": "ô", r"{\"o}": "ö", r"{\'o}": "ó",
        r"{\^i}": "î", r"{\"i}": "ï", r"{\'i}": "í",
        r"{\"u}": "ü",
        r"{\c{c}}": "ç", r"{\c c}": "ç",
        r"{\v{z}}": "ž", r"{\v{s}}": "š", r"{\v{c}}": "č",
        r"{\'E}": "É",
        r"{\`E}": "È",
        r"\&": "&",
        r"~": " ",
    }
    for latex, char in replacements.items():
        text = text.replace(latex, char)
    # Retire les accolades restantes
    text = text.replace("{", "").replace("}", "")
    # Nettoie les espaces multiples
    text = " ".join(text.split())
    return text.strip()


def get_field(entry, key, default=""):
    """Récupère un champ d'une entrée et nettoie le LaTeX."""
    return clean_latex(entry.get(key, default))


def article_to_pub(entry):
    """@article → journals"""
    pub = {
        "title":     get_field(entry, 'title'),
        "authors":   get_field(entry, 'author'),
        "journal":   get_field(entry, 'journal'),
        "year":      int(get_field(entry, 'year', '0')),
        "volume":    get_field(entry, 'volume'),
        "pages":     get_field(entry, 'pages'),
        "publisher": get_field(entry, 'publisher'),
        "doi":       get_field(entry, 'doi'),
        "abstract":  get_field(entry, 'abstract'),
    }
    url = get_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def inproceedings_to_pub(entry):
    """@inproceedings → conferences"""
    pub = {
        "title":     get_field(entry, 'title'),
        "authors":   get_field(entry, 'author'),
        "booktitle": get_field(entry, 'booktitle'),
        "series":    get_field(entry, 'series'),
        "year":      int(get_field(entry, 'year', '0')),
        "pages":     get_field(entry, 'pages'),
        "publisher": get_field(entry, 'publisher'),
        "doi":       get_field(entry, 'doi'),
        "abstract":  get_field(entry, 'abstract'),
    }
    url = get_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def misc_to_pub(entry):
    """@misc → preprints"""
    pub = {
        "title":         get_field(entry, 'title'),
        "authors":       get_field(entry, 'author'),
        "archiveprefix": get_field(entry, 'archiveprefix'),
        "eprint":        get_field(entry, 'eprint'),
        "year":          int(get_field(entry, 'year', '0')),
        "doi":           get_field(entry, 'doi'),
        "abstract":      get_field(entry, 'abstract'),
    }
    url = get_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def book_to_pub(entry):
    """@book → books"""
    pub = {
        "title":     get_field(entry, 'title'),
        "authors":   get_field(entry, 'author'),
        "publisher": get_field(entry, 'publisher'),
        "series":    get_field(entry, 'series'),
        "year":      int(get_field(entry, 'year', '0')),
        "pages":     get_field(entry, 'pages'),
        "doi":       get_field(entry, 'doi'),
        "abstract":  get_field(entry, 'abstract'),
    }
    url = get_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


def phdthesis_to_pub(entry):
    """@phdthesis → phd"""
    pub = {
        "title":   get_field(entry, 'title'),
        "authors": get_field(entry, 'author'),
        "school":  get_field(entry, 'school'),
        "year":    int(get_field(entry, 'year', '0')),
        "doi":     get_field(entry, 'doi'),
        "abstract": get_field(entry, 'abstract'),
    }
    url = get_field(entry, 'url')
    if url:
        pub["pdf"] = url
    return pub


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
    with open(bib_path, encoding='utf-8') as f:
        parser = bibtexparser.bparser.BibTexParser(common_strings=True)
        library = bibtexparser.load(f, parser=parser)

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
        result[category].append(pub)

    # Trie chaque catégorie par année décroissante
    for key in result:
        result[key].sort(key=lambda p: p['year'], reverse=True)

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
