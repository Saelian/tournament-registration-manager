# Tasks: add-user-profile

## Backend Tasks

- [x] 1. Créer la migration pour ajouter les colonnes `first_name`, `last_name`, `phone` à la table `users`
- [x] 2. Mettre à jour le modèle `User` avec les nouveaux champs et la propriété computed `isProfileComplete`
- [x] 3. Créer le validateur VineJS `updateProfileValidator` dans `app/validators/auth.ts`
- [x] 4. Créer l'endpoint `PATCH /auth/user/profile` dans `AuthController`
- [x] 5. Modifier la réponse de `GET /auth/user/me` pour inclure les nouveaux champs et `isProfileComplete`
- [x] 6. Ajouter les tests pour le nouvel endpoint (validation, authentification requise, isolation par session)

## Frontend Tasks

- [x] 7. Installer les composants shadcn : `avatar`, `dropdown-menu`
- [x] 8. Mettre à jour les types dans `features/auth/types.ts` (ajouter `firstName`, `lastName`, `phone`, `isProfileComplete`)
- [x] 9. Créer le schéma Zod `profileSchema` pour la validation frontend
- [x] 10. Créer le hook `useUpdateProfile` dans `features/auth/userHooks.ts`
- [x] 11. Créer le composant `ProfileForm` (formulaire réutilisable)
- [x] 12. Créer la modale `ProfileCompletionModal` avec affichage automatique si profil incomplet
- [x] 13. Créer le composant `UserMenu` (avatar + dropdown)
- [x] 14. Modifier `PublicLayout` pour utiliser `UserMenu` au lieu des boutons actuels
- [x] 15. Créer la page `/profile` avec `ProfilePage`
- [x] 16. Ajouter la route `/profile` dans `App.tsx`

## Validation Tasks

- [x] 17. Tester le flow complet : première connexion → modale → validation
- [x] 18. Tester la modification du profil depuis la page dédiée
- [x] 19. Vérifier que le dropdown fonctionne correctement
- [x] 20. Vérifier les validations frontend et backend
- [x] 21. Tests de sécurité : vérifier qu'un utilisateur ne peut accéder qu'à ses propres données (pas de paramètre userId manipulable)
- [x] 22. Vérifier que le champ téléphone n'est pas exposé dans les endpoints publics

## Dependencies
- Tâche 7 doit être faite avant les tâches 13-14
- Tâches 1-5 backend doivent être faites avant les tâches 10-12 frontend
- Tâche 11 doit être faite avant tâches 12 et 15
