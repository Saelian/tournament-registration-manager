# Tasks: Ajout lettre de référence tableau

## 1. Backend - Base de données
- [x] 1.1 Créer la migration pour ajouter la colonne `reference_letter` (varchar nullable)
- [x] 1.2 Exécuter la migration sur la base de développement

## 2. Backend - Modèle et validation
- [x] 2.1 Ajouter la propriété `referenceLetter` au modèle Table
- [x] 2.2 Mettre à jour `createTableValidator` pour accepter `referenceLetter` (string optionnel, max 5 caractères)
- [x] 2.3 Mettre à jour `updateTableValidator` pour accepter `referenceLetter`

## 3. Backend - Controller et sérialisation
- [x] 3.1 Mettre à jour la méthode `store` pour persister `referenceLetter`
- [x] 3.2 Mettre à jour la méthode `update` pour permettre la modification
- [x] 3.3 Ajouter `referenceLetter` dans la méthode `serialize`

## 4. Backend - Import CSV
- [x] 4.1 Ajouter le support de `referenceLetter` dans le parsing CSV
- [x] 4.2 Mettre à jour le template CSV avec la nouvelle colonne
- [x] 4.3 Mettre à jour `confirmImport` pour persister le champ

## 5. Frontend - Formulaires admin
- [x] 5.1 Ajouter le champ "Lettre de référence" dans le formulaire de création de tableau
- [x] 5.2 Ajouter le champ dans le formulaire de modification
- [x] 5.3 Mettre à jour les types TypeScript frontend (Table interface)

## 6. Frontend - Affichage
- [x] 6.1 Afficher la lettre de référence dans la liste des tableaux admin
- [x] 6.2 Afficher la lettre de référence dans la liste publique des tableaux
- [x] 6.3 Afficher la lettre dans le panier (CartSummary)

## 7. Validation
- [x] 7.1 Vérifier le typecheck (`pnpm typecheck`)
