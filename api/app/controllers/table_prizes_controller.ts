import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import TablePrize from '#models/table_prize'
import { createTablePrizeValidator, updateTablePrizeValidator } from '#validators/table_prize'
import { success, notFound, badRequest } from '#helpers/api_response'
import type { PrizeType } from '#models/table_prize'

export default class TablePrizesController {
    /**
     * List all prizes for a table
     */
    async index(ctx: HttpContext) {
        const { params } = ctx
        const table = await Table.find(params.table_id)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        const prizes = await TablePrize.query().where('table_id', table.id).orderBy('rank', 'asc')

        const totalCashPrize = prizes
            .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
            .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)

        return success(ctx, {
            prizes: prizes.map((p) => this.serialize(p)),
            totalCashPrize,
        })
    }

    /**
     * Show a single prize
     */
    async show(ctx: HttpContext) {
        const { params } = ctx
        const prize = await TablePrize.query().where('table_id', params.table_id).where('id', params.id).first()
        if (!prize) {
            return notFound(ctx, 'Prize not found')
        }
        return success(ctx, this.serialize(prize))
    }

    /**
     * Create a new prize for a table
     */
    async store(ctx: HttpContext) {
        const { params, request } = ctx
        const table = await Table.find(params.table_id)
        if (!table) {
            return notFound(ctx, 'Table not found')
        }

        const data = await request.validateUsing(createTablePrizeValidator)

        // Check if rank already exists for this table
        const existingPrize = await TablePrize.query().where('table_id', table.id).where('rank', data.rank).first()
        if (existingPrize) {
            return badRequest(ctx, `A prize for rank ${data.rank} already exists for this table`)
        }

        // Validate that cash prize has amount and item prize has description
        if (data.prizeType === 'cash' && !data.cashAmount) {
            return badRequest(ctx, 'Cash amount is required for cash prizes')
        }
        if (data.prizeType === 'item' && !data.itemDescription) {
            return badRequest(ctx, 'Item description is required for item prizes')
        }

        const prize = await TablePrize.create({
            tableId: table.id,
            rank: data.rank,
            prizeType: data.prizeType as PrizeType,
            cashAmount: data.prizeType === 'cash' ? data.cashAmount : null,
            itemDescription: data.prizeType === 'item' ? data.itemDescription : null,
        })

        return success(ctx, this.serialize(prize), 201)
    }

    /**
     * Update a prize
     */
    async update(ctx: HttpContext) {
        const { params, request } = ctx
        const prize = await TablePrize.query().where('table_id', params.table_id).where('id', params.id).first()
        if (!prize) {
            return notFound(ctx, 'Prize not found')
        }

        const data = await request.validateUsing(updateTablePrizeValidator)

        // Check if new rank conflicts with existing prize
        if (data.rank !== undefined && data.rank !== prize.rank) {
            const existingPrize = await TablePrize.query()
                .where('table_id', params.table_id)
                .where('rank', data.rank)
                .whereNot('id', prize.id)
                .first()
            if (existingPrize) {
                return badRequest(ctx, `A prize for rank ${data.rank} already exists for this table`)
            }
            prize.rank = data.rank
        }

        if (data.prizeType !== undefined) prize.prizeType = data.prizeType as PrizeType
        if (data.cashAmount !== undefined) prize.cashAmount = data.cashAmount ?? null
        if (data.itemDescription !== undefined) prize.itemDescription = data.itemDescription ?? null

        // Validate consistency
        if (prize.prizeType === 'cash' && !prize.cashAmount) {
            return badRequest(ctx, 'Cash amount is required for cash prizes')
        }
        if (prize.prizeType === 'item' && !prize.itemDescription) {
            return badRequest(ctx, 'Item description is required for item prizes')
        }

        await prize.save()

        return success(ctx, this.serialize(prize))
    }

    /**
     * Delete a prize
     */
    async destroy(ctx: HttpContext) {
        const { params } = ctx
        const prize = await TablePrize.query().where('table_id', params.table_id).where('id', params.id).first()
        if (!prize) {
            return notFound(ctx, 'Prize not found')
        }

        await prize.delete()
        return success(ctx, { message: 'Prize deleted' })
    }

    private serialize(prize: TablePrize) {
        return {
            id: prize.id,
            tableId: prize.tableId,
            rank: prize.rank,
            prizeType: prize.prizeType,
            cashAmount: prize.cashAmount ? Number(prize.cashAmount) : null,
            itemDescription: prize.itemDescription,
        }
    }
}
