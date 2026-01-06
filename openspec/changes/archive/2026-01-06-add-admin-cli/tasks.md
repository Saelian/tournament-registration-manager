# Tâches : add-admin-cli

## 1. Commande Ace
- [x] 1.1 Créer la commande `api/commands/admin_create.ts`
- [x] 1.2 Implémenter les prompts interactifs (email, nom, mot de passe)
- [x] 1.3 Ajouter la validation des données (email unique, longueur mot de passe)
- [x] 1.4 Créer l'administrateur en base avec mot de passe hashé
- [x] 1.5 Afficher un message de confirmation avec résumé

## 2. Tests
- [x] 2.1 Test unitaire : création d'admin avec données valides
- [x] 2.2 Test unitaire : refus si email déjà existant
- [x] 2.3 Test unitaire : refus si mot de passe trop court

## Dépendances
- La tâche 1.x doit être terminée avant les tâches 2.x
