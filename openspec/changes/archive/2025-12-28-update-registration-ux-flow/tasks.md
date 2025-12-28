# Tasks: update-registration-ux-flow (v2 - Single Page)

## 1. Creer le panneau d'inscription inline

- [x] 1.1 Creer `RegistrationPanel.tsx` avec les etapes inline :
  - Etape 1 : Formulaire OTP (si non connecte)
  - Etape 2 : Choix moi/autre + recherche licence (si connecte sans joueur)
  - Etape 3 : Recap joueur avec bouton "Changer" (si joueur selectionne)
- [x] 1.2 Afficher le statut de connexion (email ou "Non connecte")

## 2. Fusionner les pages en une seule

- [x] 2.1 Modifier `PublicTableListPage` pour integrer :
  - Le `RegistrationPanel` en haut
  - La liste des tableaux avec selection (fusion avec TableSelectionPage)
  - Le `CartSummary` en bas
- [x] 2.2 Gerer l'etat local du flux (player, registeringFor) sans navigation
- [x] 2.3 Desactiver les tableaux si aucun joueur n'est selectionne

## 3. Ajouter le formulaire OTP inline

- [x] 3.1 Extraire la logique OTP de `UserLoginPage` en composant reutilisable `InlineOtpForm`
- [x] 3.2 Integrer `InlineOtpForm` dans `RegistrationPanel`

## 4. Nettoyer les routes et composants obsoletes

- [x] 4.1 Supprimer les routes `/tournaments/:id/register` et `/tournaments/:id/register/selection`
- [x] 4.2 Simplifier `TournamentListPage` (un seul bouton vers tables)
- [x] 4.3 Mettre a jour les exports dans `registration/index.ts`

## 5. Tests

- [x] 5.1 Verifier que le code compile sans erreur
- [x] 5.2 Verifier le statut de connexion affiche dans RegistrationPanel
- [x] 5.3 Verifier que les tableaux sont desactives sans joueur selectionne
