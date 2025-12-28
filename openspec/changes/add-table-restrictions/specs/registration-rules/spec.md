## ADDED Requirements

### Requirement: Gender Eligibility
The system MUST filter tables according to player gender when restrictions apply.

#### Scenario: No Gender Restriction
- **WHEN** a table has no gender restriction (NULL)
- **THEN** the table is eligible for all players

#### Scenario: Player Eligible (Matching Gender)
- **WHEN** a female player views a women-only table (gender_restriction = 'F')
- **THEN** the table is displayed as eligible

#### Scenario: Player Ineligible (Wrong Gender)
- **WHEN** a male player views a women-only table
- **THEN** the table is greyed out with message "Réservé aux femmes"

### Requirement: Category Eligibility
The system MUST filter tables according to player age category when restrictions apply.

#### Scenario: No Category Restriction
- **WHEN** a table has no category restriction (NULL or empty)
- **THEN** the table is eligible for all players

#### Scenario: Player Eligible (Matching Category)
- **WHEN** a Benjamin player views a youth table (allowed_categories includes 'Benjamin')
- **THEN** the table is displayed as eligible

#### Scenario: Player Ineligible (Wrong Category)
- **WHEN** a Senior player views a youth table (allowed_categories = ['Poussin', 'Benjamin', 'Minime'])
- **THEN** the table is greyed out with message "Catégorie non autorisée"

## MODIFIED Requirements

### Requirement: Combined Validation
The system MUST validate all rules including gender and category restrictions before allowing registration.

#### Scenario: Successful Validation
- **WHEN** all rules are respected (points, daily limit, schedule, gender, category)
- **THEN** the registration can proceed to payment

#### Scenario: Failed Validation
- **WHEN** one or more rules are not respected
- **THEN** a detailed error message per rule is returned

#### Scenario: Gender Restriction Failed
- **WHEN** a player's gender doesn't match table restriction
- **THEN** error code `GENDER_RESTRICTED` is returned

#### Scenario: Category Restriction Failed
- **WHEN** a player's category is not in allowed_categories
- **THEN** error code `CATEGORY_RESTRICTED` is returned
