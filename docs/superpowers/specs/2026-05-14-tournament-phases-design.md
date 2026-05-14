# Design : Phases du tournoi (Avant / Événement)

**Date :** 2026-05-14  
**Statut :** Approuvé

## Contexte

L'application gère actuellement uniquement la phase "Avant" du tournoi (inscriptions, paiements, liste d'attente). Ce design introduit une deuxième phase, "Événement", qui couvre à la fois le jour du tournoi et la période post-tournoi (résultats, photos, récap). L'administrateur bascule manuellement entre les deux phases.

## Décisions clés

- **2 phases** : `before` (existant) et `event` (pendant + après)
- **Bascule manuelle** depuis la config admin — pas d'automatisme basé sur les dates
- La phase `event` ajoute une section configurable en tête de page d'accueil ; le contenu existant reste dessous
- La section événement contient : un champ URL dédié pour les résultats (avec QR code auto) + un champ markdown libre pour tout le reste

## Base de données

### Migration

Trois nouvelles colonnes sur la table `tournaments` :

| Colonne | Type | Défaut | Description |
|---|---|---|---|
| `phase` | enum(`before`, `event`) | `before` | Phase courante du tournoi |
| `event_result_url` | varchar(2048) nullable | null | URL vers le tableau des résultats (Google Sheet ou autre) |
| `event_content` | text nullable | null | Contenu markdown libre (tarifs buvette, infos pratiques, lien photos...) |

### Modèle Lucid

Ajout des trois propriétés mappées automatiquement. Propriété calculée `isEventMode` (boolean) pour simplifier les vérifications.

## API

### Endpoint public `GET /api/tournaments`

Les trois nouveaux champs sont inclus dans la sérialisation publique (aux côtés de `rulesLink`, `ffttHomologationLink` déjà exposés).

### Endpoint admin `PATCH /api/admin/tournament/:id`

Le validator VineJS accepte les trois nouveaux champs (optionnels). `phase` est validé comme enum `before | event`. `event_result_url` est validé comme URL ou chaîne vide nullable. `event_content` est un string nullable sans contrainte de format.

## Interface admin

### Nouvel onglet "Phase Événement" dans `AdminTournamentConfigPage`

1. **Toggle de phase** — deux options radio ou switch : "Avant le tournoi" / "Événement en cours". Change le champ `phase`.
2. **URL des résultats** — champ texte URL avec aperçu du QR code en temps réel dès qu'une URL valide est saisie. Bind sur `eventResultUrl`.
3. **Contenu libre** — textarea markdown. Bind sur `eventContent`. Utilisé pour : tarifs buvette, infos pratiques jour J, lien photos post-tournoi, message de remerciements...

Sauvegarde via le même endpoint `PATCH /api/admin/tournament` existant.

## Page d'accueil en mode Événement

### Nouveau composant `EventSection`

Inséré **avant** le hero (en dehors du bloc dégradé). Layout retenu : **carte horizontale unique** (option C).

```
┌─────────────────────────────────────────────────────────┐
│ 🏓 TOURNOI EN COURS                       16-17 MAI 2026 │  ← barre rouge
├────────────┬────────────────────────────────────────────┤
│            │ 📊 Résultats en direct                      │
│  [QR CODE] │ Scannez ou cliquez pour suivre l'avancement │
│  72×72px   │ → docs.google.com/spreadsheets/...          │
│            │                                             │
├────────────┴────────────────────────────────────────────┤
│  Contenu markdown rendu ici (buvette, infos, photos...)  │  ← bande grise
└─────────────────────────────────────────────────────────┘
```

- Fichier : `web/src/features/tournament/components/EventSection.tsx`
- QR code généré côté client via la bibliothèque `qrcode.react`
- Le markdown est rendu via le composant `MarkdownRenderer` déjà disponible dans le projet
- Le composant ne s'affiche que si `tournament.phase === 'event'`
- Si `eventResultUrl` est null, la partie QR code / lien est masquée (seul le markdown s'affiche)
- Si `eventContent` est null, la bande du bas est masquée

### Blocs masqués en mode Événement

| Bloc | Mode `before` | Mode `event` |
|---|---|---|
| Badge inscriptions | ✅ visible | ❌ masqué |
| CTA "Je m'inscris" / "Voir les tableaux" | ✅ visible | ❌ masqué |
| Section "Pourquoi participer" (4 cartes) | ✅ visible | ❌ masqué |
| Section finale "Prêt à relever le défi ?" | ✅ visible | ❌ masqué |
| Infos tournoi (date, lieu, dotation) | ✅ visible | ✅ visible |
| Bande de stats (tableaux, places, joueurs) | ✅ visible | ✅ visible |
| Liste des tableaux | ✅ visible | ✅ visible |
| Sponsors | ✅ visible | ✅ visible |
| Description longue (`longDescription`) | ✅ visible | ✅ visible |
| Liens règlement / homologation FFTT | ✅ visible | ✅ visible |

### Navigation

Le menu de navigation (`PublicLayout`) n'est pas modifié — il reste identique dans les deux phases.

## Dépendances

- **`qrcode.react`** — bibliothèque React pour la génération de QR codes côté client (pas d'appel réseau externe)

## Périmètre exclu

- Pas d'automatisme de bascule de phase basé sur les dates
- Pas de troisième phase distincte "Après" — le mode `event` sert les deux usages (l'admin met à jour le contenu `eventContent` au fil du temps)
- Pas de galerie photos intégrée — un lien dans `eventContent` suffit
