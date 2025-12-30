# Change: Ajouter la gestion des prix et sponsors aux tableaux

## Why
Le club souhaite gérer les récompenses pour les gagnants des tableaux (cash prizes ou lots) et attirer des sponsors pour financer ces récompenses. Ce système permettra une meilleure visibilité des dotations et une gestion transparente du financement par tableau.

## What Changes
- **Gestion des prix/lots par tableau** : Possibilité de configurer des récompenses (cash ou lots) pour les classements (1er, 2ème, 3ème, etc.)
- **Gestion des sponsors** : Création d'une entité Sponsor avec nom, site web, email de contact et description
- **Association sponsors-tableaux** : Relation many-to-many entre sponsors et tableaux (un sponsor peut financer plusieurs tableaux, un tableau peut avoir plusieurs sponsors)
- **Sponsor global du tournoi** : Un sponsor peut aussi sponsoriser le tournoi dans sa globalité (sans être associé à un tableau spécifique), ce qui lui donnera une visibilité accrue
- **Calcul du coût du tableau** : Somme automatique des cash prizes pour évaluer le financement nécessaire

## Impact
- Affected specs: `table-management` (modification), `sponsor-management` (nouveau)
- Affected code:
  - Nouvelles tables: `sponsors`, `table_sponsors`, `table_prizes`
  - Nouveaux modèles: `Sponsor`, `TablePrize`
  - Modification: Model `Table` (relations)
  - Nouveaux endpoints API: CRUD sponsors, gestion prizes
  - Frontend: Formulaires de configuration admin, affichage public
