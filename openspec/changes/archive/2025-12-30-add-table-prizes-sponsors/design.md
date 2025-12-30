## Context
Le club organise des tournois et souhaite :
1. Attirer des sponsors pour financer les récompenses
2. Définir des récompenses (cash ou lots) pour les gagnants de chaque tableau
3. Calculer le coût total des récompenses par tableau pour équilibrer avec les sponsors

## Goals / Non-Goals

**Goals:**
- Permettre la gestion des sponsors au niveau du tournoi
- Permettre l'association flexible de sponsors à un ou plusieurs tableaux
- Permettre qu'un sponsor sponsorise le tournoi globalement (visibilité accrue)
- Un sponsor peut cumuler : sponsoring global ET financement de tableaux spécifiques
- Permettre la définition de prix (cash/lots) par rang pour chaque tableau
- Calculer automatiquement le "coût" d'un tableau (somme des cash prizes)

**Non-Goals:**
- Gestion financière complète (factures, paiements sponsors)
- Upload de logos sponsors (URLs seulement pour MVP)
- Historique des sponsors entre tournois

## Decisions

### Modèle de données

**Decision**: Trois nouvelles tables avec relations

```
sponsors
├── id
├── tournament_id (FK)
├── name (string, required)
├── website_url (string, nullable)
├── contact_email (string, nullable)
├── description (text, nullable)
├── is_global (boolean, default false) -- sponsor du tournoi entier (visibilité accrue)
└── timestamps
Note: is_global=true n'empêche pas d'être aussi associé à des tableaux spécifiques via table_sponsors

table_prizes
├── id
├── table_id (FK)
├── rank (int) -- 1 = 1er, 2 = 2ème, etc.
├── prize_type ('cash' | 'item')
├── cash_amount (decimal, nullable) -- en euros, si type = cash
├── item_description (string, nullable) -- si type = item
└── timestamps

table_sponsors (pivot table)
├── table_id (FK)
├── sponsor_id (FK)
└── timestamps
```

**Alternatives considered:**
- JSONB pour les prizes dans la table `tables` : Rejeté car moins flexible pour les requêtes et les validations
- Sponsors au niveau tournoi uniquement sans association aux tableaux : Rejeté car le besoin est de montrer quels sponsors financent quels tableaux

### Prix en euros vs cents

**Decision**: Stocker les montants cash en euros (decimal) pour cohérence avec le champ `price` existant de la table `tables`.

### Calcul du coût du tableau

**Decision**: Attribut virtuel calculé côté application (somme des `cash_amount` des prizes de type 'cash'). Pas de colonne dénormalisée.

**Rationale**: Simplicité, évite la synchronisation. Les tableaux ont peu de prizes (3-5 max typiquement).

## Risks / Trade-offs

- **Risque**: Sponsors sans tableau associé → Acceptable, permet de créer des sponsors avant de les associer ou pour les sponsors globaux uniquement
- **Risque**: Performance sur le calcul du coût → Négligeable vu le volume (quelques dizaines de tableaux max)

## Migration Plan

1. Créer les migrations pour les nouvelles tables
2. Créer les modèles et relations Lucid
3. Créer les endpoints API admin (CRUD sponsors, gestion prizes)
4. Ajouter les interfaces frontend admin
5. Afficher les sponsors et prizes sur la page publique

Pas de migration de données existantes (nouvelles fonctionnalités).

## Open Questions

Aucune - le scope est bien défini.
