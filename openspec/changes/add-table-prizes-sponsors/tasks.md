## 1. Backend - Base de données et modèles

- [x] 1.1 Créer la migration pour la table `sponsors` (avec champ is_global)
- [x] 1.2 Créer la migration pour la table `table_prizes`
- [x] 1.3 Créer la migration pour la table pivot `table_sponsors`
- [x] 1.4 Créer le modèle `Sponsor` avec relations
- [x] 1.5 Créer le modèle `TablePrize` avec relations
- [x] 1.6 Ajouter les relations `sponsors` et `prizes` au modèle `Table`

## 2. Backend - API Sponsors

- [x] 2.1 Créer le contrôleur `SponsorsController` (CRUD)
- [x] 2.2 Créer les validateurs VineJS pour sponsors
- [x] 2.3 Ajouter les routes admin pour sponsors
- [x] 2.4 Tests des endpoints sponsors

## 3. Backend - API Prizes

- [x] 3.1 Créer le contrôleur `TablePrizesController` (CRUD par tableau)
- [x] 3.2 Créer les validateurs VineJS pour prizes
- [x] 3.3 Ajouter les routes admin pour prizes
- [x] 3.4 Implémenter le calcul du coût total (attribut virtuel)
- [x] 3.5 Tests des endpoints prizes

## 4. Backend - Association Sponsors-Tableaux

- [x] 4.1 Créer les endpoints pour associer/dissocier sponsors aux tableaux
- [x] 4.2 Modifier l'endpoint GET tables pour inclure sponsors et prizes
- [x] 4.3 Tests des associations

## 5. Frontend - Admin Sponsors

- [x] 5.1 Créer la page de liste des sponsors
- [x] 5.2 Créer le formulaire de création/édition sponsor (avec toggle is_global)
- [x] 5.3 Implémenter la suppression sponsor
- [x] 5.4 Ajouter la navigation vers la gestion des sponsors

## 6. Frontend - Admin Prizes et Associations

- [x] 6.1 Ajouter la section prizes dans le formulaire de tableau
- [x] 6.2 Ajouter le sélecteur multi-sponsors dans le formulaire de tableau
- [x] 6.3 Afficher le coût total calculé du tableau

## 7. Frontend - Affichage public

- [x] 7.1 Afficher les sponsors globaux sur la page d'accueil du tournoi
- [x] 7.2 Afficher les prizes sur la carte du tableau (page liste)
- [x] 7.3 Afficher les sponsors associés sur la carte du tableau
- [x] 7.4 Styliser l'affichage des récompenses et sponsors

## 8. Validation finale

- [x] 8.1 Tests E2E du workflow complet
- [x] 8.2 Vérifier la cohérence des calculs de coût
- [x] 8.3 Review des specs et mise à jour si nécessaire
