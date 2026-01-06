# Change: Commande CLI pour créer des administrateurs

## Pourquoi
Actuellement, la création d'un compte administrateur ne se fait qu'à l'initialisation du projet via le seeder qui utilise des variables d'environnement. Il n'existe aucun moyen d'ajouter des administrateurs supplémentaires après le déploiement initial, ce qui bloque les organisations qui souhaitent avoir plusieurs administrateurs.

## Ce qui change
- Nouvelle commande Ace `admin:create` pour créer des administrateurs via CLI
- La commande est interactive : elle demande email, nom complet et mot de passe
- Exécution uniquement en ligne de commande sur le serveur (pas d'API, pas d'IHM)
- Validation des données (email unique, mot de passe conforme)
- Hashage sécurisé du mot de passe (Argon2, via le système existant)

## Décisions de sécurité
- **Aucune route API** : Création d'admin uniquement via accès SSH au serveur
- **Aucune interface web** : Pas de formulaire d'inscription admin
- **Validation stricte** : Email doit être unique, mot de passe minimum 8 caractères

## Impact
- Specs affectées : `admin-auth` (ajout d'un requirement)
- Code affecté :
  - `api/commands/admin_create.ts` (nouveau)
  - `api/adonisrc.ts` (enregistrement de la commande, automatique)
