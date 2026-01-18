import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tournament from '#models/tournament'
import Player from '#models/player'

/**
 * Représente l'association d'un joueur à un tournoi avec son numéro de dossard.
 * Un joueur conserve le même numéro de dossard pour toutes ses inscriptions
 * à un même tournoi.
 */
export default class TournamentPlayer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tournamentId: number

  @column()
  declare playerId: number

  @column()
  declare bibNumber: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Tournament)
  declare tournament: BelongsTo<typeof Tournament>

  @belongsTo(() => Player)
  declare player: BelongsTo<typeof Player>
}
