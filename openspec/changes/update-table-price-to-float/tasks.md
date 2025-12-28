# Tasks: Prix des tableaux en float

## 1. Migration base de données
- [ ] 1.1 Créer la migration pour changer `price` de `integer` à `decimal(10,2)`
- [ ] 1.2 Migrer les données existantes (diviser par 100)

## 2. Backend
- [ ] 2.1 Mettre à jour le modèle `Table` si nécessaire
- [ ] 2.2 Mettre à jour le validateur (accepter les décimaux)
- [ ] 2.3 Vérifier que les API retournent le prix en euros

## 3. Frontend
- [ ] 3.1 Mettre à jour le type `Table` (price: number)
- [ ] 3.2 Vérifier les formulaires admin (saisie en euros)
- [ ] 3.3 Vérifier l'affichage dans les vues publiques

## 4. Tests
- [ ] 4.1 Corriger les tests existants avec les nouvelles valeurs
