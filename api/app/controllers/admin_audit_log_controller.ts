import type { HttpContext } from '@adonisjs/core/http'
import Registration from '#models/registration'
import Payment from '#models/payment'
import { success } from '#helpers/api_response'

type AuditEventType =
  | 'inscription_utilisateur'
  | 'inscription_admin'
  | 'promotion_liste_attente'
  | 'paiement_confirme'
  | 'remboursement'
  | 'annulation_admin'
  | 'pointage'

interface AuditEvent {
  id: string
  type: AuditEventType
  timestamp: string
  playerName: string
  playerId: number
  playerLicence: string
  tableName: string | null
  actor: string | null
  details: string
}

const PAYMENT_METHOD_ACTOR: Record<string, string> = {
  helloasso: 'HelloAsso',
  cash: 'Espèces',
  check: 'Chèque',
  card: 'CB',
}

export default class AdminAuditLogController {
  async index(ctx: HttpContext) {
    const playerIdParam = ctx.request.input('playerId')
    const playerId = playerIdParam !== null && playerIdParam !== '' && !Number.isNaN(Number(playerIdParam))
      ? Number(playerIdParam)
      : null

    const registrationQuery = Registration.query()
      .preload('player')
      .preload('table')
      .preload('user')
      .preload('createdByAdmin')
      .preload('cancelledByAdmin')

    if (playerId) {
      registrationQuery.where('player_id', playerId)
    }

    const paymentQuery = Payment.query()
      .where((q) => {
        q.where('status', 'succeeded').orWhereNotNull('refunded_at')
      })
      .preload('registrations', (q) => {
        q.preload('player').preload('table')
      })

    if (playerId) {
      paymentQuery.whereHas('registrations', (q) => {
        q.where('player_id', playerId)
      })
    }

    const [registrations, payments] = await Promise.all([registrationQuery, paymentQuery])

    const events: AuditEvent[] = []

    // Build registration events
    for (const reg of registrations) {
      const playerName = `${reg.player.firstName} ${reg.player.lastName}`
      const tableName = reg.table.name
      const base = {
        playerName,
        playerId: reg.player.id,
        playerLicence: reg.player.licence,
        tableName,
      }

      if (reg.isAdminCreated) {
        events.push({
          id: `reg-${reg.id}-created`,
          type: 'inscription_admin',
          timestamp: reg.createdAt.toISO()!,
          ...base,
          actor: reg.createdByAdmin?.fullName ?? null,
          details: `${tableName} – Inscription admin`,
        })
      } else {
        events.push({
          id: `reg-${reg.id}-created`,
          type: 'inscription_utilisateur',
          timestamp: reg.createdAt.toISO()!,
          ...base,
          actor: reg.user.email,
          details: `${tableName} – Inscription`,
        })
      }

      if (reg.promotedAt) {
        events.push({
          id: `reg-${reg.id}-promoted`,
          type: 'promotion_liste_attente',
          timestamp: reg.promotedAt.toISO()!,
          ...base,
          actor: null,
          details: `${tableName} – Promu depuis la liste d'attente`,
        })
      }

      if (reg.cancelledByAdminId) {
        events.push({
          id: `reg-${reg.id}-cancelled`,
          type: 'annulation_admin',
          timestamp: reg.updatedAt.toISO()!,
          ...base,
          actor: reg.cancelledByAdmin?.fullName ?? null,
          details: `${tableName} – Annulation admin`,
        })
      }

      if (reg.checkedInAt) {
        events.push({
          id: `reg-${reg.id}-checkin`,
          type: 'pointage',
          timestamp: reg.checkedInAt.toISO()!,
          ...base,
          actor: null,
          details: `${tableName} – Pointage`,
        })
      }
    }

    // Build payment events
    for (const payment of payments) {
      if (payment.registrations.length === 0) continue

      const relevantRegs = playerId
        ? payment.registrations.filter((r) => r.player.id === playerId)
        : payment.registrations

      if (relevantRegs.length === 0) continue

      const firstReg = relevantRegs[0]
      const playerName = `${firstReg.player.firstName} ${firstReg.player.lastName}`
      const tableNames = [...new Set(payment.registrations.map((r) => r.table.name))].join(' / ')
      const actor = PAYMENT_METHOD_ACTOR[payment.paymentMethod] ?? payment.paymentMethod
      const amountFormatted = (payment.amount / 100).toFixed(2).replace('.', ',') + ' €'

      const base = {
        playerName,
        playerId: firstReg.player.id,
        playerLicence: firstReg.player.licence,
        tableName: tableNames || null,
        actor,
      }

      if (payment.status === 'succeeded') {
        events.push({
          id: `pay-${payment.id}-succeeded`,
          type: 'paiement_confirme',
          timestamp: payment.updatedAt.toISO()!,
          ...base,
          details: `${tableNames} – Paiement ${actor} (${amountFormatted})`,
        })
      }

      if (payment.refundedAt) {
        events.push({
          id: `pay-${payment.id}-refunded`,
          type: 'remboursement',
          timestamp: payment.refundedAt.toISO()!,
          ...base,
          details: `${tableNames} – Remboursement ${actor} (${amountFormatted})`,
        })
      }
    }

    events.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

    return success(ctx, { events })
  }
}
