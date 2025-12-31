import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Registration from '#models/registration'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare helloassoCheckoutIntentId: string

  @column()
  declare helloassoOrderId: string | null

  @column()
  declare amount: number

  @column()
  declare helloassoPaymentId: string | null

  @column()
  declare status:
    | 'pending'
    | 'succeeded'
    | 'failed'
    | 'expired'
    | 'refunded'
    | 'refund_pending'
    | 'refund_failed'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Registration, {
    pivotTable: 'payment_registrations',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare registrations: ManyToMany<typeof Registration>
}
