import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Player from '#models/player'
import Table from '#models/table'
import Payment from '#models/payment'

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

    @column()
    declare isAdminCreated: boolean

    @column.dateTime()
    declare checkedInAt: DateTime | null

    @column()
    declare presenceStatus: 'unknown' | 'present' | 'absent'

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

    @manyToMany(() => Payment, {
        pivotTable: 'payment_registrations',
        pivotTimestamps: {
            createdAt: 'created_at',
            updatedAt: false,
        },
    })
    declare payments: ManyToMany<typeof Payment>
}
