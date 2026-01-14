#!/bin/sh
set -e

echo "🔍 Debug: Variables MAIL/SMTP disponibles:"
env | grep -iE "smtp|mail_" || echo "Aucune variable SMTP/MAIL trouvée"

echo "🔄 Exécution des migrations..."
node build/bin/console.js migration:run --force

echo "👤 Création/mise à jour de l'administrateur initial..."
node build/bin/console.js db:seed --files="database/seeders/admin_seeder.ts"

echo "✅ Initialisation terminée, démarrage de l'API..."
exec "$@"
