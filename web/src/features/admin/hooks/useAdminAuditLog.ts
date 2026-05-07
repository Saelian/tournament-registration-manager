import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'

export type AuditEventType =
  | 'inscription_utilisateur'
  | 'inscription_admin'
  | 'promotion_liste_attente'
  | 'paiement_confirme'
  | 'remboursement'
  | 'remboursement_partiel'
  | 'annulation_admin'
  | 'annulation_joueur'
  | 'demande_remboursement'
  | 'pointage'

export interface AuditEvent {
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

interface AuditLogResponse {
  events: AuditEvent[]
}

async function fetchAuditLog(playerId?: number): Promise<AuditLogResponse> {
  const params = playerId !== undefined ? { playerId } : {}
  const response = await api.get<AuditLogResponse>('/admin/audit-log', { params })
  return response.data
}

export function useAdminAuditLog(playerId?: number) {
  return useQuery({
    queryKey: ['admin', 'audit-log', playerId],
    queryFn: () => fetchAuditLog(playerId),
  })
}
