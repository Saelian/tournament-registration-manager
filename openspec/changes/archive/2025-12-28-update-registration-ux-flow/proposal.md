# Change: Ameliorer le flux d'inscription utilisateur (Single-Page)

## Why

L'experience utilisateur actuelle du parcours d'inscription presente plusieurs problemes :
1. **Trop de changements de page** : Quand l'utilisateur clique sur "S'inscrire", il perd la visibilite sur les tableaux
2. **Login sur une page separee** : La demande d'email OTP se fait sur une autre page, ce qui casse le flux
3. **Pas d'indication de connexion** : L'utilisateur ne sait pas s'il est connecte ou non

## What Changes

### Principe : Tout sur une seule page

La page `/tournaments/:id/tables` devient la page centrale du flux d'inscription. Tous les elements sont integres inline :

1. **Header avec statut de connexion**
   - Si connecte : affiche l'email de l'utilisateur
   - Si non connecte : affiche "Non connecte"

2. **Panneau d'inscription lateral ou en haut** (toujours visible)
   - Si non connecte : formulaire email + OTP inline
   - Si connecte mais pas de joueur : choix moi/autre + recherche licence
   - Si joueur selectionne : recap du joueur avec bouton "Changer"

3. **Liste des tableaux** (toujours visible)
   - Avant selection joueur : tableaux visibles mais non cliquables (indication "Selectionnez un joueur")
   - Apres selection joueur : tableaux avec eligibilite, cliquables

4. **Panier flottant** (en bas)
   - Affiche les tableaux selectionnes et le total

### Suppression des pages separees

- Supprimer `/tournaments/:id/register`
- Supprimer `/tournaments/:id/register/selection`
- Tout se passe sur `/tournaments/:id/tables`

## Impact

- Affected specs: `registration-flow`
- Affected code:
  - `web/src/features/public/TableListPage.tsx` - Devient la page principale d'inscription
  - `web/src/App.tsx` - Suppression des routes register
  - `web/src/features/registration/RegistrationPage.tsx` - A supprimer ou transformer en composant inline
  - `web/src/features/registration/TableSelectionPage.tsx` - Fusionner avec TableListPage
  - Nouveau composant `RegistrationPanel.tsx` pour le panneau d'inscription
