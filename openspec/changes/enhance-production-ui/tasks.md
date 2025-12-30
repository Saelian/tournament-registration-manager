## 1. Composants UI de base

- [ ] 1.1 Créer le composant `Hero.tsx` avec style neo-brutalism (titre, description, CTA, image optionnelle)
- [ ] 1.2 Créer le composant `StepIndicator.tsx` (numéro, icône, titre, description)
- [ ] 1.3 Créer le composant `FAQ.tsx` basé sur Radix Accordion avec style neo-brutalism
- [ ] 1.4 Créer le composant `StatCard.tsx` (label, valeur, icône, trend optionnel)
- [ ] 1.5 Ajouter les dépendances Radix si nécessaires (Accordion)

## 2. SortableDataTable

- [ ] 2.1 Créer le hook `useTableSort` pour gérer l'état de tri
- [ ] 2.2 Créer le hook `useTableFilters` pour gérer les filtres avec persistance URL
- [ ] 2.3 Créer le composant `SearchInput.tsx` pour la recherche globale
- [ ] 2.4 Créer le composant `FilterDropdown.tsx` pour les filtres par colonne
- [ ] 2.5 Créer le composant `SortableDataTable.tsx` intégrant tri, recherche et filtres
- [ ] 2.6 Ajouter les icônes de tri (asc/desc/none) aux headers de colonnes
- [ ] 2.7 Implémenter la pagination optionnelle avec composant `Pagination.tsx`
- [ ] 2.8 Écrire les tests unitaires pour les hooks de tri/filtre

## 3. Landing Page

- [ ] 3.1 Créer la section Hero avec informations clés du tournoi
- [ ] 3.2 Créer la section "Comment s'inscrire" avec 3 étapes visuelles
- [ ] 3.3 Créer la section FAQ avec questions fréquentes hardcodées
- [ ] 3.4 Refactorer `LandingPage.tsx` pour intégrer les nouvelles sections
- [ ] 3.5 Améliorer le responsive design (mobile-first)
- [ ] 3.6 Ajouter des animations subtiles (apparition au scroll optionnel)

## 4. Dashboard Admin avec KPIs

- [ ] 4.1 Créer la page `AdminDashboardPage.tsx` avec layout KPIs
- [ ] 4.2 Créer le hook `useAdminStats` pour agréger les données existantes
- [ ] 4.3 Implémenter les cartes KPIs (inscrits, revenus, taux remplissage)
- [ ] 4.4 Implémenter la section alertes (tableaux >80%, paiements en attente)
- [ ] 4.5 Ajouter un lien "Accueil" dans `AdminLayout.tsx` vers le dashboard
- [ ] 4.6 Mettre à jour le routing pour faire du dashboard la page par défaut admin

## 5. Amélioration interface Admin

- [ ] 5.1 Migrer `TableListPage.tsx` vers SortableDataTable avec tri/filtres
- [ ] 5.2 Ajouter filtres par date, statut de remplissage, fourchette de points
- [ ] 5.3 Améliorer l'affichage de la liste des tableaux (cards → table si pertinent)
- [ ] 5.4 Ajouter des actions rapides inline (éditer, supprimer sans navigation)

## 6. Dashboard Utilisateur

- [ ] 6.1 Migrer la liste des inscriptions vers SortableDataTable
- [ ] 6.2 Ajouter tri par date d'inscription, nom du tableau, statut
- [ ] 6.3 Améliorer les filtres existants avec le nouveau système
- [ ] 6.4 Uniformiser le style avec le reste de l'application (neo-brutalism)

## 7. Tests et polish

- [ ] 7.1 Tester le responsive sur mobile/tablet/desktop
- [ ] 7.2 Vérifier l'accessibilité (focus states, aria labels, navigation clavier)
- [ ] 7.3 Valider la cohérence visuelle Neo-Brutalism sur toutes les pages
- [ ] 7.4 Vérifier les performances (lazy loading si nécessaire)
- [ ] 7.5 Mettre à jour les tests existants si impactés
