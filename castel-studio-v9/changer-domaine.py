#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Castel Studio — bascule de domaine.

Remplace le domaine dans TOUS les fichiers du site : canoniques, og:url,
sitemap.xml, robots.txt, llms.txt et les blocs JSON-LD.

Usage :
    CASTEL_DOMAINE="https://castelstudio.fr" python3 changer-domaine.py

Après la bascule : mettre une redirection 301 permanente de l'ancien domaine
vers le nouveau. Ne jamais laisser deux domaines répondre 200 en même temps.
"""
import glob, os, sys

CONNUS = [
    "https://castelstudio.netlify.app",
    "https://castel-studio.vercel.app",
    "https://castel-studio.netlify.app",
    "https://castelstudio.vercel.app",
    "https://castelstudio.fr",
    "https://www.castelstudio.fr",
]

cible = os.environ.get("CASTEL_DOMAINE", "").rstrip("/")
if not cible:
    cible = input("Nouveau domaine (ex. https://castelstudio.fr) : ").strip().rstrip("/")
if not cible.startswith("https://"):
    sys.exit("Le domaine doit commencer par https://")

ici = os.path.dirname(os.path.abspath(__file__))
os.chdir(ici)

cibles = []
for motif in ("*.html", "*.xml", "*.txt", "*.json", "assets/js/*.js"):
    cibles += glob.glob(motif)

total = 0
for f in cibles:
    s = open(f, encoding="utf-8").read()
    avant = s
    for a in CONNUS:
        if a != cible:
            s = s.replace(a, cible)
    if s != avant:
        open(f, "w", encoding="utf-8").write(s)
        total += 1
        print("modifié :", f)

print(f"\n{total} fichier(s) mis à jour → {cible}")
print("Pensez à : 301 depuis l'ancien domaine, puis Search Console (nouvelle propriété + sitemap).")
