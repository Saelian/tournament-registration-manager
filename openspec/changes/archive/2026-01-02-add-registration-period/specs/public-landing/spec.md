## MODIFIED Requirements

### Requirement: Hero Section
La page d'accueil MUST afficher une section Hero attractive en haut de page avec les informations essentielles du tournoi, un appel à l'action, et l'état actuel de la période d'inscription.

#### Scenario: Affichage du Hero
- **WHEN** un visiteur accède à la page d'accueil avec un tournoi actif
- **THEN** une section Hero affiche le nom du tournoi, les dates, le lieu, et un bouton d'inscription dont l'état dépend de la période

#### Scenario: Hero responsive
- **WHEN** un visiteur consulte la page sur mobile
- **THEN** le Hero s'adapte avec un layout vertical et le CTA reste accessible

#### Scenario: Hero sans tournoi
- **WHEN** aucun tournoi n'est actif
- **THEN** la section Hero n'est pas affichée (message "Aucun tournoi en cours" à la place)

#### Scenario: Panneau avant ouverture
- **WHEN** un visiteur consulte la page avant l'ouverture des inscriptions
- **THEN** le panneau affiche "Ouverture des inscriptions le [date formatée]" et le bouton est désactivé

#### Scenario: Panneau inscriptions ouvertes
- **WHEN** un visiteur consulte la page pendant la période d'inscription
- **THEN** le panneau affiche "Inscriptions ouvertes jusqu'au [date formatée]" et le bouton est actif

#### Scenario: Panneau inscriptions terminées
- **WHEN** un visiteur consulte la page après la fermeture des inscriptions
- **THEN** le panneau affiche "Inscriptions terminées depuis le [date formatée]" et le bouton est désactivé

#### Scenario: Panneau sans période configurée
- **WHEN** aucune période n'est configurée sur le tournoi
- **THEN** le panneau affiche "Inscriptions ouvertes" et le bouton est actif

## MODIFIED Requirements

### Requirement: Affichage des tableaux en DataTable
Le système MUST afficher la liste des tableaux du tournoi dans un composant DataTable triable et filtrable sur la page d'accueil, avec les boutons d'inscription adaptés à la période.

#### Scenario: Liste des tableaux
- **WHEN** un visiteur consulte la page d'accueil
- **THEN** un DataTable affiche tous les tableaux avec : nom, date/horaire, fourchette de points, places restantes

#### Scenario: Tri des colonnes
- **WHEN** un visiteur clique sur un header de colonne
- **THEN** les tableaux sont triés selon cette colonne (alternance asc/desc)

#### Scenario: Recherche de tableau
- **WHEN** un visiteur tape dans la barre de recherche
- **THEN** les tableaux sont filtrés en temps réel selon le texte saisi

#### Scenario: Inscription depuis le tableau (période ouverte)
- **WHEN** un visiteur clique sur le bouton "S'inscrire" pendant la période d'inscription
- **THEN** il est redirigé vers le flux d'inscription pour ce tableau

#### Scenario: Inscription depuis le tableau (hors période)
- **WHEN** un visiteur consulte la page hors de la période d'inscription
- **THEN** les boutons d'inscription sont désactivés avec un tooltip explicatif

#### Scenario: Tableau complet
- **WHEN** un tableau n'a plus de places disponibles
- **THEN** la colonne "Places" affiche "Complet" et le bouton d'inscription mentionne la liste d'attente
