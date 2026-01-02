# Change: Ajout des dates de début et fin d'inscription

## Why

Actuellement, les inscriptions sont toujours ouvertes dès qu'un tournoi existe. Il n'est pas possible de définir une période d'inscription (date d'ouverture et de fermeture). Cette fonctionnalité est essentielle pour :
- Contrôler quand les joueurs peuvent s'inscrire
- Communiquer clairement l'état des inscriptions aux visiteurs
- Éviter les inscriptions tardives ou prématurées

## What Changes

### Backend
- **TournamentOptions** : Ajout de `registrationStartDate` et `registrationEndDate` (dates optionnelles)
- **RegistrationRulesService** : Nouvelle méthode `checkRegistrationPeriod()` pour vérifier si la période est active
- **RegistrationsController** : Vérification de la période avant création/validation d'inscriptions
- **TournamentController** : Retourne l'état calculé de la période (`registrationStatus`)

### Frontend
- **LandingPage** : Panneau d'état adaptatif selon la période
  - Avant ouverture : "Ouverture des inscriptions le [date]"
  - En cours : "Inscriptions ouvertes jusqu'au [date]"
  - Terminées : "Inscriptions terminées depuis le [date]"
- **Boutons d'inscription** : Désactivés hors période avec message explicatif
- **TableListPage** : Adaptation des boutons selon l'état

### Règles métier
- Si aucune date n'est définie → inscriptions ouvertes (comportement actuel)
- Si seule `registrationStartDate` définie → ouverture à cette date, pas de fermeture
- Si seule `registrationEndDate` définie → ouvert maintenant, fermeture à cette date
- Si les deux définies → période entre les deux dates

## Impact
- **Specs modifiées** : `tournament-config`, `registration-flow`, `public-landing`
- **Code affecté** :
  - `api/app/models/tournament.ts`
  - `api/app/services/registration_rules_service.ts`
  - `api/app/controllers/registrations_controller.ts`
  - `api/app/controllers/admin/tournament_controller.ts`
  - `web/src/features/public/LandingPage.tsx`
  - `web/src/features/public/TableListPage.tsx`
  - `web/src/features/registration/TableSelectionPage.tsx`
