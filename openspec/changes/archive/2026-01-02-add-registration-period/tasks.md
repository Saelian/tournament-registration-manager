# Tasks: add-registration-period

## 1. Backend - Modèle et validation
- [x] 1.1 Ajouter `registrationStartDate` et `registrationEndDate` à l'interface `TournamentOptions` dans `tournament.ts`
- [x] 1.2 Mettre à jour `defaultOptions` avec les nouvelles valeurs (null par défaut)
- [x] 1.3 Ajouter la validation VineJS dans le validator de tournoi (dates cohérentes)
- [x] 1.4 Retourner le `registrationStatus` calculé dans GET /admin/tournament et GET /api/tournament

## 2. Backend - Service de vérification période
- [x] 2.1 Créer `RegistrationPeriodService` ou ajouter à `RegistrationRulesService`
  - Méthode `checkRegistrationPeriod(tournament): { isOpen, status, relevantDate }`
- [x] 2.2 Ajouter les types/interfaces pour le statut de période

## 3. Backend - Protection API
- [x] 3.1 Modifier `RegistrationsController.store()` pour vérifier la période avant création
- [x] 3.2 Modifier `RegistrationsController.validate()` pour vérifier la période
- [x] 3.3 Retourner les codes d'erreur appropriés (`REGISTRATION_NOT_OPEN`, `REGISTRATION_CLOSED`)

## 4. Frontend - Types et API
- [x] 4.1 Mettre à jour les types TypeScript pour `Tournament` et `TournamentOptions`
- [x] 4.2 Ajouter le type `RegistrationStatus` avec les états possibles

## 5. Frontend - Landing Page
- [x] 5.1 Modifier le panneau d'état des inscriptions dans `LandingPage.tsx`
- [x] 5.2 Adapter le texte selon le statut : pas encore ouverte / ouverte jusqu'à / terminée
- [x] 5.3 Désactiver les boutons d'inscription hors période
- [x] 5.4 Ajouter formatage des dates en français

## 6. Frontend - Page liste des tableaux
- [x] 6.1 Modifier les boutons d'inscription dans `TableListPage.tsx`
- [x] 6.2 Ajouter bannière explicative quand période fermée
- [x] 6.3 Masquer le panneau d'inscription hors période

## 7. Frontend - Page de sélection des tableaux
- [x] 7.1 Bloquer l'accès à `TableSelectionPage.tsx` si hors période
- [x] 7.2 Rediriger automatiquement vers la liste des tableaux si nécessaire

## 8. Admin - Configuration tournoi
- [x] 8.1 Ajouter les champs date de début/fin dans le formulaire admin
- [x] 8.2 Gérer les valeurs dans reset() et defaultValues
- [x] 8.3 Afficher l'aperçu du statut calculé

## 9. Tests et validation
- [x] 9.1 Vérifier le typecheck (✅ passé)
- [x] 9.2 Corriger les fichiers de tests avec les nouveaux champs TournamentOptions
- [x] 9.3 Vérification finale réussie
