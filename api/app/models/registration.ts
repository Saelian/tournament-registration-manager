import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Payment from '#models/payment'
import Admin from '#models/admin'

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
  declare adminId: number | null

  @column()
  declare status: 'pending_payment' | 'paid' | 'waitlist' | 'cancelled'

  @column()
  declare waitlistRank: number | null

  @column()
  declare isAdminCreated: boolean

  @column.dateTime()
  declare checkedInAt: DateTime | null

  @column()
  declare presenceStatus: 'unknown' | 'present' | 'absent'

  @column.dateTime()
  declare promotedAt: DateTime | null

  @column()
  declare cancelledByAdminId: number | null

  @column()
  declare refundStatus: 'none' | 'requested' | 'done' | null

  @column()
  declare refundMethod: 'cash' | 'check' | 'bank_transfer' | null

  @column.dateTime()
  declare refundedAt: DateTime | null

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

  @belongsTo(() => Admin)
  declare createdByAdmin: BelongsTo<typeof Admin>

  @belongsTo(() => Admin, { foreignKey: 'cancelledByAdminId' })
  declare cancelledByAdmin: BelongsTo<typeof Admin>

  @manyToMany(() => Payment, {
    pivotTable: 'payment_registrations',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare payments: ManyToMany<typeof Payment>
}
