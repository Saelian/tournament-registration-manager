import mail from '@adonisjs/mail/services/main'
import Admin from '#models/admin'
import Payment from '#models/payment'
import User from '#models/user'

class AdminNotificationService {
    /**
     * Notify all admins about a refund request
     */
    async notifyRefundRequest(payment: Payment, user: User): Promise<void> {
        const admins = await Admin.all()
        const adminEmails = admins.map((admin) => admin.email)

        if (adminEmails.length === 0) {
            console.warn('[AdminNotification] No admins found to notify')
            return
        }

        const displayName = user.fullName || user.firstName || user.email
        const amountFormatted = (payment.amount / 100).toFixed(2)

        // Send email to each admin
        for (const adminEmail of adminEmails) {
            await mail.send((message) => {
                message.to(adminEmail).subject(`Demande de remboursement - ${displayName}`).html(`
            <h1>Nouvelle demande de remboursement</h1>
            <p>Un utilisateur a demandé un remboursement :</p>
            <ul>
              <li><strong>Inscripteur :</strong> ${displayName}</li>
              <li><strong>Email :</strong> ${user.email}</li>
              <li><strong>Montant :</strong> ${amountFormatted} €</li>
              <li><strong>ID Paiement :</strong> ${payment.id}</li>
              <li><strong>Date du paiement :</strong> ${payment.createdAt.toFormat('dd/MM/yyyy HH:mm')}</li>
            </ul>
            <p>Connectez-vous à l'interface d'administration pour traiter cette demande.</p>
          `)
            })
        }
    }
}

const adminNotificationService = new AdminNotificationService()
export default adminNotificationService
