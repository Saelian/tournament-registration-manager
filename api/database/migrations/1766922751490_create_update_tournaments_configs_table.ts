import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournaments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add options JSONB column for extensible configuration
      table.jsonb('options').notNullable().defaultTo('{}')

      // Add content columns
      table.string('short_description', 500).nullable()
      table.text('long_description').nullable()
      table.string('rules_link', 2048).nullable()
      table.text('rules_content').nullable()
      table.string('fftt_homologation_link', 2048).nullable()
    })

    // Migrate existing data into options JSONB
    this.defer(async (db) => {
      const tournaments = await db.from(this.tableName).select('*')

      for (const tournament of tournaments) {
        const options = {
          refundDeadline: tournament.refund_deadline,
          waitlistTimerHours: tournament.waitlist_timer_hours ?? 4,
        }

        await db
          .from(this.tableName)
          .where('id', tournament.id)
          .update({ options: JSON.stringify(options) })
      }
    })

    // Drop old columns after data migration
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('refund_deadline')
      table.dropColumn('waitlist_timer_hours')
    })
  }

  async down() {
    // Restore old columns
    this.schema.alterTable(this.tableName, (table) => {
      table.date('refund_deadline').nullable()
      table.integer('waitlist_timer_hours').notNullable().defaultTo(4)
    })

    // Migrate data back from JSONB to columns
    this.defer(async (db) => {
      const tournaments = await db.from(this.tableName).select('*')

      for (const tournament of tournaments) {
        const options = typeof tournament.options === 'string' ? JSON.parse(tournament.options) : tournament.options

        await db
          .from(this.tableName)
          .where('id', tournament.id)
          .update({
            refund_deadline: options.refundDeadline,
            waitlist_timer_hours: options.waitlistTimerHours ?? 4,
          })
      }
    })

    // Drop new columns
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('options')
      table.dropColumn('short_description')
      table.dropColumn('long_description')
      table.dropColumn('rules_link')
      table.dropColumn('rules_content')
      table.dropColumn('fftt_homologation_link')
    })
  }
}
