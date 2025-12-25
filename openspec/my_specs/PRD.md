# 1. Vue d'ensemble et Objectifs

But : Fournir une application web simplifiée permettant la gestion complète des inscriptions, du paiement et du pointage pour un tournoi de tennis de table. 
Philosophie : "Zéro friction". 
Pas de compte utilisateur complexe, pas de mot de passe. 
Priorité à la rapidité d'inscription et à l'efficacité administrative le jour J. 
Périmètre (Scope) : Inscriptions en ligne, paiement, liste d'attente automatisée, gestion administrative, pointage sur place. 
Exclusion : Gestion sportive (arbres, poules).
# 2. Acteurs (Personas)

1. Le Gestionnaire (Admin) : Organisateur du tournoi. Il configure les tableaux, suit les finances et gère le pointage le jour J.
2. Le Souscripteur (Utilisateur Public) : La personne qui navigue sur le site. Il possède l'adresse email. Il peut être le joueur lui-même ou un tiers (entraîneur, parent).
3. Le Joueur : La personne physique qui jouera. Identifiée par son N° de Licence FFTT.

# 3. Spécifications Fonctionnelles (Par Module)

## MODULE A : Authentification & Gestion Utilisateur (Front-Office)

Principe : Authentification "Passwordless" (sans mot de passe).

- A1. Connexion par OTP :
	- L'utilisateur saisit son email.
	- Le système envoie un code à 6 chiffres (ou un lien magique) par email.
	- La session est active pour une durée déterminée.    
	- Cas d'usage : S'inscrire, modifier une inscription, payer un solde.

- A2. Tableau de bord Utilisateur ("Mes Inscriptions") :
	- Liste de toutes les inscriptions liées à cet email.
	- Statut visuel : Validé, En attente de paiement, Liste d'attente, Annulé.
## MODULE B : Parcours d'Inscription

Principe : Vérification stricte des règles avant paiement.

- B1. Recherche Licencié (API FFTT) :
	- Champ de saisie : "Numéro de licence" ou "Nom/Prénom".
	- Appel API FFTT pour récupérer : Nom, Prénom, Club, Points officiels, Sexe, Catégorie d'âge.
	- Si API indisponible : Permettre la saisie manuelle (avec flag "À vérifier" pour l'admin).
- B2. Identification du Joueur :
	- Question : "Qui inscrivez-vous ?"
	- Choix 1 : "Moi-même" (Le profil joueur est lié à l'email du souscripteur).
	- Choix 2 : "Un autre joueur" (Parent/Coach). L'email du souscripteur gère l'inscription, mais le nom du joueur est différent.

- B3. Sélection des Tableaux (Logique Métier) :
	- Affichage des tableaux éligibles selon les points du joueur (Filtre : Points Joueur <= Points Max Tableau).
	- Affichage du taux de remplissage (Barre de progression ou "X places restantes").
	- Contrôle de validation (Bloquant) :
	- Max 2 tableaux par jour (Sauf si tableau tagué "Spécial").
	- Pas de tableaux au même horaire de début.
	- Interdiction si Sexe ou Age ne correspond pas (si paramétré).

- B4. Gestion de la Saturation :
	- Si Inscrits < Capacité : Bouton "S'inscrire".
	- Si Inscrits >= Capacité : Bouton "M'ajouter à la liste d'attente" (Pas de paiement immédiat).

## MODULE C : Paiement et Annulation
- C1. Paiement en ligne (API HelloAsso) :
	- Calcul du total panier.
	- Inscription confirmée uniquement après succès du paiement (Callback Webhook).
- C2. Annulation par le joueur :
	- Bouton "Se désinscrire" sur le tableau de bord.
	- Règle : Si Date du jour < Date Butoir -> Déclenchement remboursement API (total ou partiel selon config).
	- Règle : Si Date du jour > Date Butoir -> Désinscription sans remboursement (message d'avertissement).

## MODULE D : Automate Liste d'Attente (Backend)

Cœur complexe de l'application. Doit fonctionner via des tâches planifiées (CRON) ou des événements.

- D1. Déclencheur : Une place se libère (Désinscription ou Admin supprime un joueur).
- D2. Notification Prioritaire :
	- Le système prend le rang 1 de la liste d'attente.
	- Envoi d'un email avec lien unique de paiement.
	- Démarrage d'un Timer (ex: 4h ou 12h, paramétrable).
- D3. Expiration du Timer :
- Si pas de paiement à T+Delai :
	- L'inscription passe en statut Liste d'attente - Expire.
	- Le joueur est déplacé en toute fin de la liste d'attente actuelle.
	- Le système déclenche la procédure (D2) pour le joueur suivant.

## MODULE E : Administration (Configuration)
- E1. CRUD Tournoi & Tableaux :
	- Création des tableaux : Nom, Jour, Heure début, Prix, Points Min/Max, Quota places.   
	- Option "Tableau Spécial" (Checkbox : ignore la règle des 2 tableaux/jour).
	- Configuration globale : Date du tournoi, Date butoir remboursement, Durée du Timer liste d'attente.   

- E2. Gestion des Inscrits :
	- Tableau complet avec filtres (Tableau, Statut Paiement, Club).
	- Actions manuelles : Ajouter un joueur (bypass règles possible), Supprimer (choix remboursement Oui/Non), Changer statut paiement (ex: reçu chèque).

- E3. Exports (CSV) :
	- Format "Juge Arbitre" : Licence, Nom, Prénom, Points, Club (groupé par tableau).
	- Format "Comptabilité" : Liste des paiements.
## MODULE F : Pointage (Jour du Tournoi)

Interface Tablette/Mobile First.

- F1. Sélecteur de Jour : Onglets "Samedi" / "Dimanche".
- F2. Liste Intelligente :

- Barre de recherche instantanée (Nom ou Licence).
- Liste alphabétique globale des joueurs du jour.
- Indicateur visuel à côté du nom : Liste des tableaux où il est inscrit (ex: "Tableau A - 9h", "Tableau C - 14h").

- F3. Action de Pointage :
	- Switch ON/OFF ou Bouton "Présent".
	- Horodatage de l'action enregistré en base.
	- Filtre rapide : "Afficher uniquement les absents".

- F4. Inscription "Last Minute" :
	- Formulaire simplifié pour ajouter un joueur sur place.
    - Choix paiement : "Espèces", "Chèque", "QR Code (En ligne)".
# 4. Découpage des Tâches (Roadmap Technique)
## Phase 1 : Squelette & Back-office (Admin)
- Setup du projet et Base de données.
- Authentification Admin.
- CRUD (Création/Modif) des Tableaux et paramètres du tournoi.
- Intégration API FFTT (test de récupération des données joueur).
## Phase 2 : Inscription Publique (Cœur)
- Authentification OTP (Email).
- Formulaire de recherche joueur (API FFTT) et distinction "Moi" vs "Tiers".
- Logique de sélection des tableaux (Moteur de règles : points, horaires, quotas).
- Intégration Paiement (HelloAsso API).
## Phase 3 : Gestion avancée des flux
- Mise en place de la Liste d'Attente (Logique d'inscription si plein).
- Développement de l'automate (Cron jobs) : Mail de libération, Timer, Rotation de la liste.
- Gestion des Annulations et Remboursements automatiques.
## Phase 4 : Module "Jour J" (Pointage)
- Interface responsive pour le pointage.
- Logique de filtrage par jour.
- Exports CSV pour le Juge-Arbitre.
- Tests de charge et scénarios "Coach inscrit 10 gamins".