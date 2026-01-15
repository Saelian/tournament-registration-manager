import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'

export type PrizeType = 'cash' | 'item'

export default class TablePrize extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare tableId: number

    @column()
    declare rank: number

    @column()
    declare prizeType: PrizeType

    @column()
    declare cashAmount: number | null

    @column()
    declare itemDescription: string | null

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => Table)
    declare table: BelongsTo<typeof Table>
}
