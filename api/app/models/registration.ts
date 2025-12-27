import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'

export default class Registration extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare playerId: number

  @column()
  declare tableId: number

  @column()
  declare status: 'pending_payment' | 'paid' | 'waitlist' | 'cancelled'

  @column()
  declare waitlistRank: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Player)
  declare player: BelongsTo<typeof Player>

  @belongsTo(() => Table)
  declare table: BelongsTo<typeof Table>
}