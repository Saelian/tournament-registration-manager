# public-navigation Specification Delta

## ADDED Requirements

### Requirement: Navigation universelle publique
La barre de navigation publique MUST afficher des liens de navigation pour tous les visiteurs, connectés ou non.

#### Scenario: Affichage pour visiteur non authentifié
- **WHEN** un visiteur non connecté accède à une page publique
- **THEN** une barre de navigation avec les liens Accueil, Inscription, Joueurs, Par tableau est visible

#### Scenario: Affichage pour utilisateur connecté
- **WHEN** un utilisateur authentifié accède à une page publique
- **THEN** la barre de navigation affiche les mêmes liens publics plus les liens personnels (Profil, Mes inscriptions)

#### Scenario: Lien Inscription conditionnel
- **WHEN** les inscriptions sont fermées (`registrationStatus.isOpen === false`)
- **THEN** le lien "Inscription" est visuellement désactivé ou affiche un tooltip explicatif

---

### Requirement: Page Joueurs inscrits par tableau
Le système MUST fournir une page affichant tous les joueurs inscrits organisés par tableau en accordéon.

#### Scenario: Affichage de la page
- **WHEN** un visiteur accède à `/players/by-table`
- **THEN** une liste de tous les tableaux du tournoi est affichée en accordéon

#### Scenario: Header d'un tableau fermé
- **WHEN** un tableau est affiché en mode fermé (non déplié)
- **THEN** le header affiche le nom du tableau, une progress bar du remplissage, et le ratio inscrits/quota (ex: "24/32")

#### Scenario: Contenu d'un tableau ouvert
- **WHEN** un visiteur clique sur un tableau pour le déplier
- **THEN** la liste des joueurs inscrits à ce tableau s'affiche sous forme de DataTable

#### Scenario: Tableau vide
- **WHEN** un tableau n'a aucun inscrit
- **THEN** le header affiche "0/X" avec une progress bar vide et un message "Aucun inscrit" quand déplié

---

### Requirement: Page FAQ dynamique
Le système MUST fournir une page FAQ affichant les questions/réponses configurées par l'administrateur.

#### Scenario: Affichage de la FAQ
- **WHEN** un visiteur accède à `/faq`
- **THEN** les questions/réponses configurées dans le tournoi sont affichées en accordéon

#### Scenario: FAQ vide
- **WHEN** aucune question FAQ n'est configurée
- **THEN** un message indique qu'aucune FAQ n'est disponible

#### Scenario: Lien FAQ conditionnel
- **WHEN** aucune FAQ n'est configurée dans le tournoi
- **THEN** le lien "FAQ" n'apparaît pas dans la navigation

---

### Requirement: Lien vers le règlement dans la navigation
La barre de navigation MUST afficher un lien vers le règlement du tournoi si configuré.

#### Scenario: Règlement configuré
- **WHEN** le tournoi a un `rulesLink` configuré
- **THEN** un lien "Règlement" est affiché dans la navigation, s'ouvrant dans un nouvel onglet

#### Scenario: Règlement non configuré
- **WHEN** le tournoi n'a pas de `rulesLink`
- **THEN** aucun lien "Règlement" n'est affiché dans la navigation

---

### Requirement: Navigation responsive
La navigation MUST s'adapter aux écrans mobiles via un menu burger.

#### Scenario: Affichage mobile
- **WHEN** un visiteur accède au site depuis un écran mobile (< 768px)
- **THEN** les liens de navigation sont cachés derrière un menu burger

#### Scenario: Menu burger ouvert
- **WHEN** un visiteur clique sur le menu burger
- **THEN** tous les liens de navigation sont affichés verticalement dans un menu déroulant
