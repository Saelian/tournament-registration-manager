## 1. Backend - Base de données
- [x] 1.1 Créer migration pour ajouter colonne `presence_status` (enum: unknown, present, absent)
- [x] 1.2 Migrer les données existantes (checkedInAt non-null → present, sinon unknown)
- [x] 1.3 Mettre à jour le modèle `Registration` avec le nouveau champ

## 2. Backend - Contrôleur de pointage
- [x] 2.1 Modifier `AdminCheckinController.players()` pour retourner `presenceStatus` au lieu de simplement `checkedInAt`
- [x] 2.2 Modifier `AdminCheckinController.checkin()` pour définir `presenceStatus = 'present'`
- [x] 2.3 Ajouter `AdminCheckinController.markAbsent()` pour définir `presenceStatus = 'absent'`
- [x] 2.4 Modifier `AdminCheckinController.cancelCheckin()` pour remettre `presenceStatus = 'unknown'`
- [x] 2.5 Mettre à jour les statistiques pour inclure les 3 catégories

## 3. Backend - Routes et exports
- [x] 3.1 Ajouter route POST `/admin/checkin/:registrationId/absent`
- [x] 3.2 Mettre à jour les exports CSV pour inclure le statut de présence

## 4. Frontend - Types et API
- [x] 4.1 Mettre à jour les types dans `checkin/types.ts`
- [x] 4.2 Ajouter le hook `useMarkAbsent` dans `checkin/hooks.ts`

## 5. Frontend - Interface utilisateur
- [x] 5.1 Modifier `CheckinPage.tsx` pour afficher les 3 états visuels
- [x] 5.2 Ajouter les boutons d'action pour chaque état
- [x] 5.3 Mettre à jour les statistiques avec les 3 catégories
- [x] 5.4 Mettre à jour les filtres (Tous / Présents / Absents / Inconnus)

## 6. Tests
- [x] 6.1 Ajouter tests pour `markAbsent` dans `admin_checkin.spec.ts`
- [x] 6.2 Mettre à jour les tests existants pour la nouvelle structure

## 7. Documentation
- [ ] 7.1 Mettre à jour le walkthrough final
