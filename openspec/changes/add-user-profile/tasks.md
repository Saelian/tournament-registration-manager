# Tasks: add-user-profile

## Backend Tasks

- [ ] 1. Créer la migration pour ajouter les colonnes `first_name`, `last_name`, `phone` à la table `users`
- [ ] 2. Mettre à jour le modèle `User` avec les nouveaux champs et la propriété computed `isProfileComplete`
- [ ] 3. Créer le validateur VineJS `updateProfileValidator` dans `app/validators/auth.ts`
- [ ] 4. Créer l'endpoint `PATCH /auth/user/profile` dans `UsersController`
- [ ] 5. Modifier la réponse de `GET /auth/user/me` pour inclure les nouveaux champs et `isProfileComplete`
- [ ] 6. Ajouter les tests pour le nouvel endpoint (validation, authentification requise, isolation par session)

## Frontend Tasks

- [ ] 7. Installer les composants shadcn : `avatar`, `dropdown-menu`
- [ ] 8. Mettre à jour les types dans `features/auth/types.ts` (ajouter `firstName`, `lastName`, `phone`, `isProfileComplete`)
- [ ] 9. Créer le schéma Zod `profileSchema` pour la validation frontend
- [ ] 10. Créer le hook `useUpdateProfile` dans `features/auth/userHooks.ts`
- [ ] 11. Créer le composant `ProfileForm` (formulaire réutilisable)
- [ ] 12. Créer la modale `ProfileCompletionModal` avec affichage automatique si profil incomplet
- [ ] 13. Créer le composant `UserMenu` (avatar + dropdown)
- [ ] 14. Modifier `PublicLayout` pour utiliser `UserMenu` au lieu des boutons actuels
- [ ] 15. Créer la page `/profile` avec `ProfilePage`
- [ ] 16. Ajouter la route `/profile` dans `App.tsx`

## Validation Tasks

- [ ] 17. Tester le flow complet : première connexion → modale → validation
- [ ] 18. Tester la modification du profil depuis la page dédiée
- [ ] 19. Vérifier que le dropdown fonctionne correctement
- [ ] 20. Vérifier les validations frontend et backend
- [ ] 21. Tests de sécurité : vérifier qu'un utilisateur ne peut accéder qu'à ses propres données (pas de paramètre userId manipulable)
- [ ] 22. Vérifier que le champ téléphone n'est pas exposé dans les endpoints publics

## Dependencies
- Tâche 7 doit être faite avant les tâches 13-14
- Tâches 1-5 backend doivent être faites avant les tâches 10-12 frontend
- Tâche 11 doit être faite avant tâches 12 et 15
