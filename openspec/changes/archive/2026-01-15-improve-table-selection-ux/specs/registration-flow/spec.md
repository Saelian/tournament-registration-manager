# registration-flow Specification Delta

## MODIFIED Requirements

### Requirement: Cart Summary
The system MUST display a cart summary before payment, including clear information about the payment process and expiration rules.

#### Scenario: Cart Display
- **WHEN** a user has selected tables
- **THEN** the summary shows each table, its price, and the total

#### Scenario: Registration/Waitlist Distinction
- **WHEN** the cart contains full tables
- **THEN** they are marked "Waitlist" and excluded from the total to pay

#### Scenario: Payment Information Display
- **WHEN** le panier contient au moins un tableau sélectionné
- **THEN** un message indique que la validation redirige vers Hello Asso pour le paiement
- **AND** un message indique que les inscriptions non payées sont automatiquement annulées après 30 minutes

---

## ADDED Requirements

### Requirement: Table Selection Visual Feedback
The system MUST provide clear visual feedback when a table is selected, with a prominent indicator in the top-right corner.

#### Scenario: Selection Indicator Position
- **WHEN** un utilisateur sélectionne un tableau éligible
- **THEN** une icône de validation (check) apparaît en position proéminente dans le coin supérieur droit de la card

#### Scenario: Selection Indicator Visibility
- **WHEN** un tableau est sélectionné
- **THEN** l'indicateur de sélection est visuellement distinct et immédiatement perceptible (fond coloré, taille suffisante)

#### Scenario: Deselection Indicator
- **WHEN** un utilisateur désélectionne un tableau
- **THEN** l'icône de validation disparaît immédiatement
