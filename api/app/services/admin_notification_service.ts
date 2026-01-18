import Admin from '#models/admin'
import Payment from '#models/payment'
import User from '#models/user'
import mailService from '#services/mail_service'

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
    const paymentDate = payment.createdAt.toFormat('dd/MM/yyyy HH:mm')

    // Send email to each admin
    for (const adminEmail of adminEmails) {
      await mailService.sendRefundRequest({
        adminEmail,
        displayName,
        userEmail: user.email,
        amountFormatted,
        paymentId: payment.id,
        paymentDate,
      })
    }
  }
}

const adminNotificationService = new AdminNotificationService()
export default adminNotificationService
