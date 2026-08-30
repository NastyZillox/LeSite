# Verdalia

Fangame **solo** dans le style des RPG Game Boy Advance (vue de dessus, cases, combats tour par tour). Jouable dans le navigateur, y compris sur iPhone.

Ce n’est **pas** un produit Nintendo : créatures, cartes et sprites sont originaux (hommage visuel Gen 3, pas de ressources officielles).

## Lancer

```bash
cd verdalia
npm install
npm run dev
```

Puis ouvre l’URL locale (en général `http://localhost:5173`). Sur iPhone, utilise l’IP de la machine sur le même Wi‑Fi.

Build production :

```bash
npm run build
npm run preview
```

## Commandes

| Action | Clavier | Tactile |
| --- | --- | --- |
| Marcher | Flèches ou WASD | Croix |
| A (parler / valider) | Z, C, Espace, Entrée | bouton A |
| B (courir / retour) | X, L, Maj | bouton B |
| Menu | Échap | START |
| Sauvegarde rapide | — | SELECT ou START → Sauvegarder |

## Zone jouable (v1)

1. Chambre → maison → **Bourgfeuillage**
2. Laboratoire du **Prof. Sauge** : choisir Pyronille (Feu), Aquilou (Eau) ou Sylfeuille (Plante)
3. **Centre de Soins** (soin + sauvegarde)
4. **Route 1** : herbes hautes, rencontres, capture (Sphères)
5. **Arène Roche** : un dresseur + le champion **Granit** (Badge Roc)

Sauvegarde : `localStorage` (Continuer au titre, PC, infirmerière, menu START).
