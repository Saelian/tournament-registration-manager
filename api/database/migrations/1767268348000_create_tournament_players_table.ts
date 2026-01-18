import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tournament_players'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('tournament_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tournaments')
        .onDelete('CASCADE')

      table.integer('player_id').unsigned().notNullable().references('id').inTable('players').onDelete('CASCADE')

      table.integer('bib_number').unsigned().notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Contrainte unique: un joueur ne peut avoir qu'un seul dossard par tournoi
      table.unique(['tournament_id', 'player_id'])
      // Contrainte unique: un numéro de dossard ne peut être utilisé qu'une fois par tournoi
      table.unique(['tournament_id', 'bib_number'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
