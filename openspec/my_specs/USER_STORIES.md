# Liste des User Stories - Gestion Tournoi Tennis de Table

## Phase 1 : Socle Technique & Configuration (Admin)

L'objectif est de permettre aux administrateurs de configurer la structure du tournoi avant l'ouverture des inscriptions.

- US-1.1 : Création de tableaux
- En tant qu' Admin,
- je veux créer un nouveau "Tableau" en définissant ses paramètres (Nom, Points Min/Max, Heure de début, Jour du tournoi, Quota de places, Prix),
- afin de structurer l'offre sportive de la compétition.

- US-1.2 : Configuration des remboursements
- En tant qu' Admin,
- je veux définir une date et heure butoir de remboursement,
- afin que le système sache automatiquement quand refuser les demandes de remboursement des joueurs.
- US-1.3 : Tableaux Spéciaux
- En tant qu' Admin,
- je veux activer un marqueur "Tableau Spécial" sur certains tableaux (ex: Doubles, Toutes Séries),
- afin d' exempter les joueurs s'inscrivant à ce tableau de la règle limitant à "2 tableaux par jour".
- US-1.4 : Inscription Manuelle (Back-office)
- En tant qu' Admin,
- je veux inscrire manuellement un joueur en ayant la possibilité de contourner les règles (quotas ou points),
- afin de gérer les cas exceptionnels (Wildcards, erreurs de saisie, invités).
- US-1.5 : Exports CSV
- En tant qu' Admin,
- je veux exporter la liste des inscrits par tableau en format CSV (incluant N° licence, points, club),
- afin de pouvoir importer ces données dans le logiciel de gestion de tournoi (SPID/GIRPE).


## Phase 2 : Inscription Publique & Paiement

L'objectif est de permettre une inscription fluide et autonome pour les participants.

- US-2.1 : Authentification sans mot de passe
- En tant que Souscripteur (Utilisateur public),
- je veux me connecter en saisissant mon email et en recevant un code OTP (ou lien magique),
- afin de ne pas avoir à créer de compte ni mémoriser de mot de passe.

- US-2.2 : Tableau de bord
- En tant que Souscripteur,
- je veux voir la liste de toutes mes inscriptions (passées et en cours) avec leur statut,
- afin de vérifier si je suis bien inscrit ou toujours en liste d'attente.

- US-2.3 : Recherche par Licence (Mise à jour)
- En tant que Souscripteur,
- je veux saisir uniquement le Numéro de Licence du joueur,
- afin d' identifier le joueur de manière unique via la base FFTT (ou Mock) sans risque d'homonymie.

- US-2.4 : Distinction Payeur / Joueur
- En tant que Souscripteur,
- je veux pouvoir préciser si j'inscris "Moi-même" ou "Un tiers" (autre joueur),
- afin que le système enregistre le bon nom sur la feuille de match, même si c'est mon email qui gère le dossier.

- US-2.5 : Contrôle des conflits horaires
- En tant que Système,
- je veux empêcher la sélection simultanée de deux tableaux ayant la même heure de début,
- afin d' éviter qu'un joueur ne soit appelé à deux endroits en même temps.

- US-2.6 : Contrôle des limites quantitatives
- En tant que Système,
- je veux bloquer la validation si un joueur a sélectionné plus de 2 tableaux pour une même journée (hors tableaux spéciaux),
- afin de faire respecter le règlement sportif.

- US-2.7 : Paiement en ligne
- En tant que Souscripteur,
- je veux payer la totalité de mon panier par carte bancaire,
- afin de valider définitivement mes inscriptions (les inscriptions non payées ne sont pas validées).

- US-2.8 : Annulation et Remboursement
- En tant que Souscripteur,
- je veux cliquer sur un bouton "Se désinscrire",
- afin de libérer ma place.
    
- Critère d'acceptation : Si la date actuelle < Date Butoir, un remboursement est déclenché. Sinon, la place est libérée sans remboursement.
    
## Phase 3 : Automate de la Liste d'Attente

L'objectif est d'optimiser le remplissage des tableaux sans intervention humaine.

- US-3.1 : Inscription en attente
- En tant que Souscripteur,
- je veux m'inscrire en "Liste d'attente" si un tableau est complet (sans payer),
- afin d' être averti si une place se libère.

- US-3.2 : Notification de place libre
- En tant que Système,
- je veux détecter qu'une place s'est libérée et envoyer automatiquement un email au joueur Rang 1 de la liste d'attente avec un lien de paiement,
- afin de combler le vide le plus vite possible.

- US-3.3 : Timer de validation
- En tant que Système,
- je veux démarrer un compte à rebours (ex: 4h ou 12h) au moment de l'envoi du mail,
- afin de ne pas bloquer la place si le joueur ne réagit pas.

- US-3.4 : Rotation automatique (Expiration)
- En tant que Système,
- je veux vérifier l'expiration du Timer. Si le délai est dépassé sans paiement :
1. Le joueur actuel est déplacé en fin de liste d'attente.
2. Le processus recommence pour le joueur suivant,
- afin de donner sa chance au suivant et garantir le remplissage du tableau.


## Phase 4 : Module "Jour J" (Pointage)

L'objectif est d'accélérer l'accueil des joueurs le jour du tournoi.

- US-4.1 : Filtrage par Jour (Mise à jour)
- En tant qu' Admin,
- je veux sélectionner une date spécifique parmi les jours du tournoi (via un menu/onglets),
- afin de filtrer la liste et n'afficher que les joueurs attendus ce jour-là (gestion multi-jours).

- US-4.2 : Vue Synthétique Joueur
- En tant qu' Admin,
- je veux voir en un coup d'œil tous les tableaux d'un joueur pour la journée sélectionnée lors de son pointage,
- afin de lui confirmer ses horaires de convocation.

- US-4.3 : Action de Pointage
- En tant qu' Admin,
- je veux valider la présence d'un joueur via un simple bouton/switch ("Check-in"),
- afin d' enregistrer son heure d'arrivée en base de données.

- US-4.4 : Identification des Absents
- En tant qu' Admin,
- je veux visualiser rapidement les joueurs inscrits mais non pointés (code couleur ou filtre),
- afin de pouvoir faire les appels micro ou les rayer des poules avant le début du tournoi.

- US-4.5 : Inscription "Last Minute"
- En tant qu' Admin,
- je veux inscrire un joueur sur place via un formulaire simplifié et noter son mode de paiement (Espèces/Chèque/QR Code),
- afin de combler les désistements de dernière minute.


## Note Technique (Pour les développeurs)

- API FFTT : Pour la phase de développement (V1), les appels vers la Fédération seront simulés ("Mockés") avec un jeu de données de test (fichier JSON statique) pour ne pas dépendre de la disponibilité de l'API réelle.
- Dates : Le système doit gérer les fuseaux horaires correctement, mais le tournoi est considéré comme ayant lieu sur un fuseau unique (France Métropolitaine par défaut).
