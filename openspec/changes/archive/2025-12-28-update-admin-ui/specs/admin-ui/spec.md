## ADDED Requirements

### Requirement: Reusable Card Component
The system MUST provide a reusable Card component with neo-brutalist styling.

#### Scenario: Card with Header and Content
- **WHEN** a developer uses Card with CardHeader and CardContent
- **THEN** the card displays with border-2, shadow offset, and proper spacing

#### Scenario: Card Variants
- **WHEN** a Card component is rendered
- **THEN** it applies the neo-brutal style: `border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`

#### Scenario: Card Composition
- **WHEN** using Card sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- **THEN** each sub-component renders with appropriate typography and spacing

### Requirement: Unified Tournament Management Page
The admin interface MUST display tournament configuration and tables list on a single page.

#### Scenario: Page Structure
- **WHEN** an admin navigates to /admin/tournament
- **THEN** the page displays tournament config at the top and tables list below

#### Scenario: Tournament Not Configured
- **WHEN** no tournament is configured
- **THEN** the configuration form is displayed without the tables section

#### Scenario: Tournament Configured
- **WHEN** a tournament is configured
- **THEN** the tournament summary cards are displayed followed by the tables list

#### Scenario: Tables Section
- **WHEN** viewing the unified page with a configured tournament
- **THEN** a "Tableaux" section header with "Nouveau Tableau" button is visible

### Requirement: Simplified Admin Navigation
The admin navigation MUST have a single entry point for tournament management.

#### Scenario: Navigation Links
- **WHEN** an admin views the admin header
- **THEN** only "Tournoi" (or "Gestion") link is visible, not separate "Tableaux" link

#### Scenario: Direct URL Access
- **WHEN** a user navigates to /admin/tables directly
- **THEN** they are redirected to /admin/tournament

### Requirement: Tournament Edit Form in Card
The tournament edit form MUST be wrapped in a Card component for visual consistency.

#### Scenario: Edit Mode Display
- **WHEN** an admin clicks "Modifier la configuration"
- **THEN** the edit form is displayed inside a Card component

#### Scenario: Create Mode Display
- **WHEN** no tournament exists and the form is shown
- **THEN** the create form is displayed inside a Card component
