## ADDED Requirements

### Requirement: Table Selection
The system MUST allow selecting desired tables.

#### Scenario: Simple Selection
- **WHEN** a user selects an eligible table
- **THEN** it is added to the cart with its price

#### Scenario: Multiple Selection
- **WHEN** a user selects multiple tables
- **THEN** all are added to the cart and the total is calculated

#### Scenario: Deselection
- **WHEN** a user deselects a table
- **THEN** it is removed from the cart and the total is recalculated

### Requirement: Cart Summary
The system MUST display a cart summary before payment.

#### Scenario: Cart Display
- **WHEN** a user has selected tables
- **THEN** the summary shows each table, its price, and the total

#### Scenario: Registration/Waitlist Distinction
- **WHEN** the cart contains full tables
- **THEN** they are marked "Waitlist" and excluded from the total to pay

### Requirement: Registration Creation
The system MUST create registrations with the correct status.

#### Scenario: Direct Registration
- **WHEN** a table has available places and payment is made
- **THEN** the registration is created with status = paid

#### Scenario: Pending Payment Registration
- **WHEN** tables are selected but not paid
- **THEN** registrations are created with status = pending_payment

#### Scenario: Waitlist Registration
- **WHEN** a table is full
- **THEN** the registration is created with status = waitlist and a rank assigned

### Requirement: Waitlist Ranking
The system MUST calculate and store the waitlist rank.

#### Scenario: First on Waitlist
- **WHEN** a player registers for a full table without a queue
- **THEN** their rank is 1

#### Scenario: Next Rank
- **WHEN** a player registers for a table with 3 people already waiting
- **THEN** their rank is 4

#### Scenario: Rank Display
- **WHEN** a player views their waitlist registration
- **THEN** their current rank is displayed

### Requirement: Registration Validation
The system MUST validate rules before creating the registration.

#### Scenario: Successful Validation
- **WHEN** all rules are respected
- **THEN** registrations are created

#### Scenario: Failed Validation
- **WHEN** a rule is not respected
- **THEN** an error is returned and no registration is created