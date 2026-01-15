import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tournament from '#models/tournament'
import Table from '#models/table'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
    async run() {
        const tournament = await Tournament.firstOrCreate(
            {},
            {
                name: 'Tournoi de Noël 2025',
                startDate: DateTime.now().plus({ days: 7 }),
                endDate: DateTime.now().plus({ days: 8 }),
                location: 'Gymnase Municipal, Paris',
                shortDescription: "Le traditionnel tournoi de fin d'année",
                longDescription: `## Bienvenue au Tournoi de Noël 2025

Un tournoi convivial pour tous les niveaux.

### Informations pratiques
- Vestiaires disponibles
- Buvette sur place
- Parking gratuit`,
            }
        )

        // Create some sample tables
        const tablesData = [
            { name: 'Tableau A', pointsMin: 0, pointsMax: 800, startTime: '09:00', price: 8 },
            { name: 'Tableau B', pointsMin: 500, pointsMax: 1200, startTime: '11:00', price: 10 },
            { name: 'Tableau C', pointsMin: 1000, pointsMax: 1800, startTime: '14:00', price: 10 },
            { name: 'Tableau D', pointsMin: 1500, pointsMax: 4000, startTime: '16:00', price: 12 },
        ]

        for (const tableData of tablesData) {
            await Table.firstOrCreate(
                { tournamentId: tournament.id, name: tableData.name },
                {
                    tournamentId: tournament.id,
                    date: tournament.startDate,
                    quota: 24,
                    isSpecial: false,
                    ...tableData,
                }
            )
        }
    }
}
