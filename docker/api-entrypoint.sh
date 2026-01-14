#!/bin/sh
set -e

echo "🔄 Exécution des migrations..."
node build/bin/console.js migration:run --force

echo "✅ Migrations terminées, démarrage de l'API..."
exec "$@"
