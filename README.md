# BACTERIOMAP

Atlas bactériologique interactif pour la formation des TABs en microbiologie.
CHUV Lausanne · Service de microbiologie

## Lancement

**Double-clic sur `index.html`** → l'application s'ouvre dans Edge.

Comme MYCODIAG : aucune installation, aucun serveur, aucun compte.

## Fichiers

- `index.html` — page principale (à double-cliquer)
- `styles.css` — apparence (mode clair/sombre)
- `data.js` — **toute la base de données** : zones, bactéries, cas de quiz
- `app.js` — logique de l'application

## Pour modifier le contenu

Ouvre **`data.js`** dans Notepad ou VS Code. Tu y trouveras trois sections :

1. `window.BACTERIOMAP_DATA.zones = { ... }` — les 10 zones anatomiques
2. `window.BACTERIOMAP_DATA.bacteries = [ ... ]` — les 29 bactéries
3. `window.BACTERIOMAP_DATA.quiz = [ ... ]` — les 7 cas de quiz

Respecte la syntaxe JavaScript (virgules, guillemets, accolades). En cas
de doute, fais une copie de sauvegarde avant de modifier.

Sauvegarde le fichier, recharge la page (`Ctrl+R`), c'est appliqué.

## Mot de passe administrateur

`microlab2025`

L'admin permet de modifier les données depuis l'interface. Les modifs
sont sauvegardées dans le navigateur (localStorage) — pour les rendre
permanentes pour tout le monde, il faut éditer `data.js` directement.

## Mode clair / sombre

Bouton soleil/lune dans le header. Le choix est mémorisé.
