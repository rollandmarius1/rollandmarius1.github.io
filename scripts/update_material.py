"""
Met à jour les champs cm, td, tp dans teaching.json
en comptant les fichiers PDF dans materiel_pedagogique/.

Usage : python3 update_material.py

Structure attendue :
  materiel_pedagogique/<année>/<nom du cours>/CM/*.pdf
  materiel_pedagogique/<année>/<nom du cours>/TD/*.pdf
  materiel_pedagogique/<année>/<nom du cours>/TP/*.pdf

L'<année> du dossier peut s'écrire soit comme la clé du JSON ("2026-2027"),
soit sous sa forme courte, l'année de rentrée ("2026").
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MATERIAL_DIR = os.path.join(BASE_DIR, "materiel_pedagogique")
JSON_PATH = os.path.join(BASE_DIR, "data", "teaching.json")


def year_dir(year):
    """Retourne le dossier correspondant à une année du JSON, ou None.

    Les clés de teaching.json sont des périodes ("2026-2027") alors que les
    dossiers sur le disque portent l'année de rentrée ("2026") : on accepte
    les deux écritures.
    """
    for name in (str(year), str(year).split('-')[0]):
        path = os.path.join(MATERIAL_DIR, name)
        if os.path.isdir(path):
            return path
    return None


def count_pdfs(year, course, material_type):
    """Compte le nombre de fichiers PDF dans un dossier."""
    base = year_dir(year)
    if base is None:
        return 0
    path = os.path.join(base, course, material_type)
    if not os.path.isdir(path):
        return 0
    return len([f for f in os.listdir(path) if f.lower().endswith('.pdf')])


def update_material():
    """Lit teaching.json, met à jour cm/td/tp, et réécrit le fichier."""
    with open(JSON_PATH, encoding='utf-8') as f:
        data = json.load(f)

    changes = 0
    for year, courses in data.items():
        for course in courses:
            name = course['course']
            for material_type in ['cm', 'td', 'tp']:
                old_val = course.get(material_type, 0)
                new_val = count_pdfs(year, name, material_type.upper())
                if old_val == new_val:
                    continue
                course[material_type] = new_val
                changes += 1
                print(f"  {year}/{name}/{material_type.upper()} : {old_val} → {new_val}")
                if new_val == 0:
                    print(f"    /!\\ aucun PDF trouvé : vérifiez que le dossier "
                          f"{name}/{material_type.upper()} existe bien pour {year}")

    if changes > 0:
        with open(JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print(f"\n{changes} champ(s) mis à jour dans teaching.json")
    else:
        print("Rien à mettre à jour, tout est synchronisé.")


if __name__ == '__main__':
    update_material()
