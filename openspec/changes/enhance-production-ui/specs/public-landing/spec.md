## ADDED Requirements

### Requirement: Hero Section
La page d'accueil MUST afficher une section Hero attractive en haut de page avec les informations essentielles du tournoi et un appel a l'action.

#### Scenario: Affichage du Hero
- **WHEN** un visiteur accede a la page d'accueil avec un tournoi actif
- **THEN** une section Hero affiche le nom du tournoi, les dates, le lieu, et un bouton "S'inscrire" bien visible

#### Scenario: Hero responsive
- **WHEN** un visiteur consulte la page sur mobile
- **THEN** le Hero s'adapte avec un layout vertical et le CTA reste accessible

#### Scenario: Hero sans tournoi
- **WHEN** aucun tournoi n'est actif
- **THEN** la section Hero n'est pas affichee (message "Aucun tournoi en cours" a la place)

### Requirement: Section Etapes d'inscription
La page d'accueil MUST afficher une section expliquant visuellement les etapes du processus d'inscription.

#### Scenario: Affichage des etapes
- **WHEN** un visiteur consulte la page d'accueil
- **THEN** une section "Comment s'inscrire" affiche 3 etapes numerotees : 1. Rechercher sa licence FFTT, 2. Choisir ses tableaux, 3. Payer en ligne

#### Scenario: Etapes avec icones
- **WHEN** les etapes sont affichees
- **THEN** chaque etape possede une icone representative et une courte description

#### Scenario: Navigation vers inscription depuis etapes
- **WHEN** un visiteur clique sur le bouton "Commencer" de la section etapes
- **THEN** il est redirige vers la page de selection des tableaux

### Requirement: Section FAQ
La page d'accueil MUST afficher une section FAQ avec les questions frequentes.

#### Scenario: Affichage FAQ
- **WHEN** un visiteur consulte la page d'accueil
- **THEN** une section FAQ en accordeon affiche les questions frequentes

#### Scenario: Questions affichees
- **WHEN** la section FAQ est visible
- **THEN** elle contient au minimum des questions sur : le remboursement, la liste d'attente, le pointage, le mode de paiement

#### Scenario: Interaction accordeon
- **WHEN** un visiteur clique sur une question
- **THEN** la reponse se deploie et les autres questions se replient

## MODIFIED Requirements

### Requirement: Affichage des tableaux en DataTable
Le systeme MUST afficher la liste des tableaux du tournoi dans un composant DataTable triable et filtrable sur la page d'accueil.

#### Scenario: Liste des tableaux
- **WHEN** un visiteur consulte la page d'accueil
- **THEN** un DataTable affiche tous les tableaux avec : nom, date/horaire, fourchette de points, places restantes

#### Scenario: Tri des colonnes
- **WHEN** un visiteur clique sur un header de colonne
- **THEN** les tableaux sont tries selon cette colonne (alternance asc/desc)

#### Scenario: Recherche de tableau
- **WHEN** un visiteur tape dans la barre de recherche
- **THEN** les tableaux sont filtres en temps reel selon le texte saisi

#### Scenario: Inscription depuis le tableau
- **WHEN** un visiteur clique sur le bouton "S'inscrire" d'une ligne du DataTable
- **THEN** il est redirige vers le flux d'inscription pour ce tableau

#### Scenario: Tableau complet
- **WHEN** un tableau n'a plus de places disponibles
- **THEN** la colonne "Places" affiche "Complet" et le bouton d'inscription mentionne la liste d'attente
