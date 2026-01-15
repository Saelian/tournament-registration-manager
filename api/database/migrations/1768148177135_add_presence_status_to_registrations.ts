import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'registrations'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            // Ajoute le statut de présence avec 3 états possibles
            // 'unknown' = non pointé (on ne sait pas s'il viendra)
            // 'present' = pointé présent
            // 'absent' = a prévenu de son absence
            table.enum('presence_status', ['unknown', 'present', 'absent']).defaultTo('unknown').notNullable()
        })

        // Migrer les données existantes : si checkedInAt est non-null, le joueur est présent
        this.defer(async (db) => {
            await db.rawQuery(`
        UPDATE registrations 
        SET presence_status = 'present' 
        WHERE checked_in_at IS NOT NULL
      `)
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('presence_status')
        })
    }
}
