import type { HttpContext } from '@adonisjs/core/http'
import Payment from '#models/payment'
import helloAssoService from '#services/hello_asso_service'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

interface HelloAssoOrderWebhook {
  eventType: string
  data: {
    id: number
    formSlug: string
    formType: string
    organizationName: string
    organizationSlug: string
    payer: {
      email: string
      firstName: string
      lastName: string
    }
    items: Array<{
      id: number
      amount: number
      name: string
      type: string
    }>
    payments: Array<{
      id: number
      amount: number
      date: string
      paymentMeans: string
      state: string
    }>
    amount: {
      total: number
      vat: number
      discount: number
    }
    meta: {
      createdAt: string
      updatedAt: string
    }
  }
  metadata?: Record<string, string>
}

export default class WebhooksController {
  /**
   * Handle HelloAsso webhook notifications.
   * Uses Double Check pattern to verify payment status.
   */
  async helloasso({ request, response }: HttpContext) {
    const payload = request.body() as HelloAssoOrderWebhook
    logger.info('Received HelloAsso webhook', {
      eventType: payload.eventType,
      orderId: payload.data?.id,
      paymentId: payload.metadata?.paymentId,
    })

    // HelloAsso envoie plusieurs types de webhooks pour une même transaction :
    // - "Order" : commande finalisée (celui qu'on traite)
    // - "Payment" : paiement autorisé (redondant car on vérifie via getCheckoutIntent)
    // - "Form" : événements liés au formulaire
    // On ne traite que les "Order" car ils contiennent toutes les infos nécessaires
    if (payload.eventType !== 'Order') {
      logger.info('HelloAsso webhook ignoré (type non traité)', {
        eventType: payload.eventType,
        reason: 'Seuls les webhooks "Order" sont traités, les autres sont redondants',
      })
      return response.ok({ message: 'Event ignored' })
    }

    const paymentId = payload.metadata?.paymentId

    if (!paymentId) {
      logger.warn('Missing paymentId in webhook metadata')
      return response.badRequest({ message: 'Missing paymentId in metadata' })
    }

    const payment = await Payment.find(Number(paymentId))

    if (!payment) {
      logger.warn('Payment not found for paymentId', { paymentId })
      return response.notFound({ message: 'Payment not found' })
    }

    if (payment.status === 'succeeded') {
      logger.info('Payment already succeeded, ignoring duplicate webhook', {
        paymentId: payment.id,
      })
      return response.ok({ message: 'Payment already processed' })
    }

    try {
      const checkoutIntentId = payment.helloassoCheckoutIntentId
      const checkoutIntent = await helloAssoService.getCheckoutIntent(Number(checkoutIntentId))

      if (!checkoutIntent.order) {
        logger.warn('Checkout intent has no order (payment not authorized)', { checkoutIntentId })
        return response.ok({ message: 'Payment not yet authorized' })
      }

      // Extract the first payment ID from the order webhook data
      // HelloAsso order contains payments array, we need the payment ID for refunds
      const helloassoPaymentId = payload.data.payments?.[0]?.id

      await db.transaction(async (trx) => {
        payment.useTransaction(trx)
        payment.helloassoOrderId = String(checkoutIntent.order!.id)
        if (helloassoPaymentId) {
          payment.helloassoPaymentId = String(helloassoPaymentId)
        }
        payment.status = 'succeeded'
        await payment.save()

        await payment.load('registrations')

        for (const registration of payment.registrations) {
          registration.useTransaction(trx)
          registration.status = 'paid'
          await registration.save()
        }
      })

      logger.info('Payment processed successfully', {
        paymentId: payment.id,
        orderId: checkoutIntent.order.id,
        registrationCount: payment.registrations.length,
      })

      return response.ok({ message: 'Payment processed' })
    } catch (error) {
      logger.error('Error verifying payment with HelloAsso', {
        error,
        paymentId,
        checkoutIntentId: payment.helloassoCheckoutIntentId,
      })
      return response.internalServerError({ message: 'Failed to verify payment' })
    }
  }
}
