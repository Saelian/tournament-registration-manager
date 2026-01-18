import { DateTime } from 'luxon'
import Tournament, { type RegistrationPeriodInfo, type RegistrationPeriodStatus } from '#models/tournament'

/**
 * Service pour vérifier l'état de la période d'inscription
 */
class RegistrationPeriodService {
  /**
   * Calcule l'état de la période d'inscription pour un tournoi
   */
  getRegistrationPeriodInfo(tournament: Tournament): RegistrationPeriodInfo {
    const now = DateTime.now()
    const { registrationStartDate, registrationEndDate } = tournament.options

    // Aucune date configurée → inscriptions ouvertes
    if (!registrationStartDate && !registrationEndDate) {
      return {
        status: 'open',
        isOpen: true,
        relevantDate: null,
        message: 'Inscriptions ouvertes',
      }
    }

    // Vérifier si la période n'a pas encore commencé
    if (registrationStartDate) {
      const startDate = DateTime.fromISO(registrationStartDate)
      if (now < startDate) {
        return {
          status: 'not_started',
          isOpen: false,
          relevantDate: registrationStartDate,
          message: `Ouverture des inscriptions le ${this.formatDate(startDate)}`,
        }
      }
    }

    // Vérifier si la période est terminée
    if (registrationEndDate) {
      const endDate = DateTime.fromISO(registrationEndDate)
      if (now > endDate) {
        return {
          status: 'closed',
          isOpen: false,
          relevantDate: registrationEndDate,
          message: `Inscriptions terminées depuis le ${this.formatDate(endDate)}`,
        }
      }
    }

    // Période active
    return {
      status: 'open',
      isOpen: true,
      relevantDate: registrationEndDate ?? null,
      message: registrationEndDate
        ? `Inscriptions ouvertes jusqu'au ${this.formatDate(DateTime.fromISO(registrationEndDate))}`
        : 'Inscriptions ouvertes',
    }
  }

  /**
   * Vérifie si les inscriptions sont actuellement ouvertes
   */
  isRegistrationOpen(tournament: Tournament): boolean {
    return this.getRegistrationPeriodInfo(tournament).isOpen
  }

  /**
   * Retourne le code d'erreur approprié si les inscriptions ne sont pas ouvertes
   */
  getErrorCode(status: RegistrationPeriodStatus): string {
    switch (status) {
      case 'not_started':
        return 'REGISTRATION_NOT_OPEN'
      case 'closed':
        return 'REGISTRATION_CLOSED'
      default:
        return 'REGISTRATION_ERROR'
    }
  }

  /**
   * Formate une date en français
   */
  private formatDate(date: DateTime): string {
    return date.setLocale('fr').toLocaleString(DateTime.DATE_FULL)
  }
}

const registrationPeriodService = new RegistrationPeriodService()
export default registrationPeriodService
