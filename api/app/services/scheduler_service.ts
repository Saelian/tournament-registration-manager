import cron from 'node-cron'
import PaymentCleanupJob from '#jobs/payment_cleanup_job'
import helloAssoConfig from '#config/helloasso'
import logger from '@adonisjs/core/services/logger'

class SchedulerService {
  private initialized = false

  initialize(): void {
    if (this.initialized) {
      return
    }

    const intervalMinutes = helloAssoConfig.cleanupIntervalMinutes

    cron.schedule(`*/${intervalMinutes} * * * *`, async () => {
      try {
        const job = new PaymentCleanupJob()
        await job.run()
      } catch (error) {
        logger.error('Payment cleanup job failed', { error })
      }
    })

    logger.info('Scheduler initialized', { cleanupIntervalMinutes: intervalMinutes })
    this.initialized = true
  }
}

const schedulerService = new SchedulerService()
export default schedulerService
