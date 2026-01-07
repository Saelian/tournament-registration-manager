## MODIFIED Requirements

### Requirement: Export Inscriptions CSV
Le système MUST permettre aux administrateurs d'exporter les inscriptions en format CSV avec des options de filtrage par présence.

#### Scenario: Export par tableau avec filtre de présence
- **WHEN** l'administrateur exporte un tableau en CSV
- **THEN** une option "Présents uniquement" est disponible dans la modale d'export

#### Scenario: Export présents uniquement activé
- **WHEN** l'option "Présents uniquement" est cochée lors de l'export
- **THEN** seuls les joueurs ayant un check-in enregistré sont exportés

#### Scenario: Export sans filtre de présence
- **WHEN** l'option "Présents uniquement" n'est pas cochée (par défaut)
- **THEN** tous les joueurs inscrits (payés ou en attente de paiement) sont exportés

#### Scenario: Colonnes disponibles enrichies
- **WHEN** la modale s'ouvre pour un export d'inscriptions
- **THEN** les colonnes proposées incluent une nouvelle colonne "Présence" (Oui/Non) et "Heure de pointage"

#### Scenario: Valeur de la colonne Présence
- **WHEN** la colonne "Présence" est incluse dans l'export
- **THEN** elle affiche "Oui" pour les joueurs pointés et "Non" pour les autres

#### Scenario: Valeur de la colonne Heure de pointage
- **WHEN** la colonne "Heure de pointage" est incluse dans l'export
- **THEN** elle affiche l'heure au format HH:mm pour les joueurs pointés, vide sinon
