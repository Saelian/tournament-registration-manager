# tournament-config Specification Delta

## MODIFIED Requirements

### Requirement: Tournament Options Structure
Le système MUST stocker les paramètres configurables du tournoi dans un objet options extensible.

#### Scenario: Options avec FAQ (ADDED)
- **WHEN** un admin configure des questions FAQ
- **THEN** les `faqItems` sont stockés dans la colonne JSONB `options`

#### Scenario: Validation des FAQ items (ADDED)
- **WHEN** un admin soumet des items FAQ invalides (question vide, réponse trop courte)
- **THEN** une erreur de validation est retournée

---

## ADDED Requirements

### Requirement: Configuration FAQ du tournoi
Le système MUST permettre de configurer des questions/réponses FAQ pour le tournoi.

#### Scenario: Structure d'un item FAQ
- **WHEN** un item FAQ est créé
- **THEN** il contient : un identifiant unique (UUID), une question (5-500 caractères), une réponse (10-2000 caractères), un ordre d'affichage

#### Scenario: FAQ dans la réponse API publique
- **WHEN** les données du tournoi sont récupérées via `GET /api/tournaments`
- **THEN** les `faqItems` sont inclus dans la réponse, triés par ordre

#### Scenario: FAQ par défaut
- **WHEN** un tournoi est créé sans faqItems
- **THEN** le champ `faqItems` est un tableau vide `[]`

#### Scenario: Mise à jour des FAQ
- **WHEN** un admin met à jour le tournoi via `PUT /admin/tournament`
- **THEN** les `faqItems` sont mis à jour (ajout, modification, suppression, réordonnancement possible)
