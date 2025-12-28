# Tasks: Prix des tableaux en float

## 1. Migration base de données
- [x] 1.1 Créer la migration pour changer `price` de `integer` à `decimal(10,2)`
- [x] 1.2 Migrer les données existantes (diviser par 100)

## 2. Backend
- [x] 2.1 Mettre à jour le modèle `Table` si nécessaire
- [x] 2.2 Mettre à jour le validateur (accepter les décimaux)
- [x] 2.3 Vérifier que les API retournent le prix en euros

## 3. Frontend
- [x] 3.1 Mettre à jour le type `Table` (price: number)
- [x] 3.2 Vérifier les formulaires admin (saisie en euros)
- [x] 3.3 Vérifier l'affichage dans les vues publiques

## 4. Tests
- [x] 4.1 Corriger les tests existants avec les nouvelles valeurs
