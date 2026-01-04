# public-landing Specification

## Purpose
TBD - created by archiving change refactor-landing-page. Update Purpose after archive.
## Requirements
### Requirement: Page d'accueil du tournoi en cours
Le systeme MUST afficher les informations du tournoi actuellement actif sur la page d'accueil sans suggerer l'existence de plusieurs tournois.

#### Scenario: Tournoi actif disponible
- **WHEN** un visiteur accede a la page d'accueil
- **THEN** les informations du tournoi actif sont affichees (nom, dates, lieu, description)

#### Scenario: Aucun tournoi actif
- **WHEN** un visiteur accede a la page d'accueil et aucun tournoi n'est actif
- **THEN** un message "Aucun tournoi en cours" est affiche

#### Scenario: Description longue
- **WHEN** le tournoi possede une description longue en markdown
- **THEN** celle-ci est rendue en HTML et affichee sur la page

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

### Requirement: Header sans lien Admin
Le header public MUST NOT afficher de lien vers l'interface d'administration.

#### Scenario: Acces admin masque
- **WHEN** un visiteur consulte la page d'accueil
- **THEN** aucun bouton ou lien vers /admin n'est visible dans le header

#### Scenario: Acces admin par URL
- **WHEN** un administrateur accede directement a /admin
- **THEN** la page de connexion admin s'affiche normalement

### Requirement: Affichage de l'etat de connexion utilisateur
Le header public MUST afficher l'etat de connexion de l'utilisateur inscrit via un avatar et menu déroulant.

#### Scenario: Utilisateur connecte avec profil complet
- **WHEN** un utilisateur avec profil complet est connecte (session active)
- **THEN** un avatar avec ses initiales (premiere lettre prenom + premiere lettre nom) est affiche dans le header

#### Scenario: Utilisateur connecte avec profil incomplet
- **WHEN** un utilisateur avec profil incomplet est connecte
- **THEN** un avatar avec une icone generique est affiche dans le header

#### Scenario: Utilisateur non connecte
- **WHEN** aucun utilisateur n'est connecte
- **THEN** un bouton "Se connecter" est affiche dans le header

### Requirement: Acces au dashboard utilisateur
Le header public MUST permettre a un utilisateur connecte d'acceder facilement a son dashboard via le menu deroulant.

#### Scenario: Lien vers le dashboard
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Mes inscriptions" mene vers /dashboard

#### Scenario: Dashboard non accessible si deconnecte
- **WHEN** un utilisateur n'est pas connecte
- **THEN** le menu deroulant n'est pas affiche

### Requirement: Acces au profil utilisateur
Le header public MUST permettre a un utilisateur connecte d'acceder a son profil.

#### Scenario: Lien vers le profil
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Mon profil" mene vers /profile

### Requirement: Deconnexion depuis le menu
Le header public MUST permettre a un utilisateur de se deconnecter depuis le menu deroulant.

#### Scenario: Option deconnexion
- **WHEN** un utilisateur est connecte et ouvre le menu deroulant
- **THEN** une option "Deconnexion" est disponible et deconnecte l'utilisateur

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

### Requirement: Liste publique des joueurs inscrits
Le système MUST afficher une page publique listant tous les joueurs inscrits au tournoi avec leurs informations non-confidentielles.

#### Scenario: Affichage de la liste globale
- **WHEN** un visiteur accède à la page `/players`
- **THEN** un DataTable affiche tous les joueurs inscrits avec : numéro de licence, nom, prénom, classement, catégorie, club, tableaux inscrits
- **AND** les lignes ne sont PAS cliquables (pas d'accès aux détails privés)

#### Scenario: Tri et recherche
- **WHEN** un visiteur utilise la barre de recherche ou clique sur un header de colonne
- **THEN** les joueurs sont filtrés/triés en temps réel

#### Scenario: Filtrage par jour
- **WHEN** le tournoi a plusieurs jours et le visiteur sélectionne un jour
- **THEN** seuls les joueurs inscrits à au moins un tableau ce jour-là sont affichés

#### Scenario: Compteur de joueurs
- **WHEN** la liste est affichée
- **THEN** un compteur indique le nombre total de joueurs correspondant aux filtres

#### Scenario: Données confidentielles masquées
- **WHEN** un visiteur consulte la liste publique
- **THEN** les informations suivantes ne sont JAMAIS affichées : email, téléphone, dossard, informations de paiement, date d'inscription

### Requirement: Liste des inscrits par tableau
Le système MUST permettre de consulter les joueurs inscrits à un tableau spécifique depuis la page d'accueil.

#### Scenario: Bouton voir inscrits
- **WHEN** un visiteur consulte la liste des tableaux sur la page d'accueil
- **THEN** chaque ligne de tableau affiche un bouton ou lien "Voir les inscrits"

#### Scenario: Nombre d'inscrits visible
- **WHEN** un visiteur consulte la liste des tableaux
- **THEN** le nombre de joueurs inscrits est affiché pour chaque tableau

#### Scenario: Modale liste par tableau
- **WHEN** un visiteur clique sur "Voir les inscrits" d'un tableau
- **THEN** une modale s'ouvre avec la liste des joueurs inscrits à ce tableau uniquement
- **AND** les colonnes affichées sont : licence, nom, prénom, classement, catégorie, club

### Requirement: Lien vers la liste publique depuis l'accueil
La page d'accueil MUST proposer un accès rapide à la liste complète des joueurs inscrits.

#### Scenario: Lien vers liste globale
- **WHEN** un visiteur consulte la page d'accueil avec un tournoi actif
- **THEN** un lien "Voir tous les inscrits" ou équivalent est visible
- **AND** ce lien mène vers la page `/players`

#### Scenario: Compteur dans le Hero ou stats
- **WHEN** un visiteur consulte la page d'accueil avec un tournoi actif
- **THEN** le nombre total de joueurs inscrits est affiché (Hero ou section statistiques)

### Requirement: API publique des inscriptions
Le système MUST exposer un endpoint API public pour récupérer les inscriptions sans données sensibles.

#### Scenario: Endpoint public accessible
- **WHEN** un client appelle `GET /api/registrations/public`
- **THEN** la liste des inscriptions est retournée sans authentification requise

#### Scenario: Données retournées
- **WHEN** l'endpoint est appelé
- **THEN** chaque inscription contient : licence, nom, prénom, points, catégorie, club, tableaux inscrits

#### Scenario: Données exclues
- **WHEN** l'endpoint est appelé
- **THEN** les données suivantes ne sont JAMAIS incluses : email, téléphone, dossard, paiement, subscriber info

#### Scenario: Filtrage par tableau
- **WHEN** un client appelle `GET /api/registrations/public?tableId=123`
- **THEN** seules les inscriptions pour ce tableau sont retournées

