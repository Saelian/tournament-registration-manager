# Tâches : enhance-public-navigation

## Préparation

- [x] Étendre `TournamentOptions` avec le champ `faqItems: FAQItem[]`
- [x] Ajouter la validation VineJS pour les items FAQ
- [x] Créer le serializer public pour les données FAQ

---

## Backend

- [x] Mettre à jour le validator `tournament.ts` pour inclure les items FAQ
- [x] S'assurer que l'endpoint `GET /api/tournaments` retourne les `faqItems` et `rulesLink`
- [x] S'assurer que l'endpoint `PUT /admin/tournament` accepte les `faqItems`

---

## Frontend - Navigation & Layout

- [x] Refactoriser `PublicLayout.tsx` pour afficher la navigation pour tous les visiteurs
- [x] Ajouter les liens : Accueil, Inscription, Joueurs inscrits, Par tableau, FAQ, Règlement
- [x] Adapter le menu burger mobile avec tous les liens
- [x] Conditionner l'affichage du lien Règlement à la présence de `rulesLink`

---

## Frontend - Nouvelle page "Inscrits par tableau"

- [x] Créer `web/src/features/public/PlayersByTablePage.tsx`
- [x] Implémenter le composant accordéon avec les tableaux
- [x] Pour chaque tableau : header avec progress bar, contenu avec `PublicPlayerTable`
- [x] Ajouter la route `/players/by-table` dans `App.tsx`

---

## Frontend - Nouvelle page FAQ

- [x] Créer `web/src/features/public/FAQPage.tsx`
- [x] Récupérer les items FAQ depuis les données du tournoi
- [x] Utiliser le composant `FAQ` existant pour l'affichage
- [x] Ajouter la route `/faq` dans `App.tsx`

---

## Frontend - Administration FAQ

- [x] Ajouter une section "FAQ" dans `TournamentConfigPage.tsx`
- [x] Créer un formulaire d'édition des questions/réponses (ajout, edit, suppression)
- [x] Ajouter un système de réordonnancement (drag & drop ou boutons haut/bas)
- [x] Valider les données côté client avec Zod

---

## Vérification

- [x] Test fonctionnel : navigation visible pour visiteurs non connectés
- [x] Test fonctionnel : page "Inscrits par tableau" avec accordéon fonctionnel
- [x] Test fonctionnel : page FAQ affiche les questions configurées
- [x] Test fonctionnel : admin peut créer/modifier/supprimer des items FAQ
- [x] Test responsive : vérifier le comportement du menu burger mobile
- [x] Test visuel : progress bars et accordéons respectent le thème néo-brutaliste
