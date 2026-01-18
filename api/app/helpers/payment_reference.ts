import Registration from '#models/registration'

const MAX_REFERENCE_LENGTH = 250

/**
 * Generate a payment reference for HelloAsso itemName.
 * Format: "NOM Prénom - Tableau1, Tableau2" (max 250 chars)
 *
 * If multiple players are in the same payment, groups by player.
 * If the reference is too long, it truncates the table names.
 */
export function generatePaymentReference(
  registrations: (Registration & {
    player: { firstName: string; lastName: string }
    table: { name: string }
  })[]
): string {
  if (registrations.length === 0) {
    return 'Inscription Tournoi'
  }

  // Group by player
  const byPlayer = new Map<number, { name: string; tables: string[] }>()

  for (const reg of registrations) {
    const playerId = reg.playerId
    const playerName = `${reg.player.lastName.toUpperCase()} ${reg.player.firstName}`
    const tableName = reg.table.name

    if (!byPlayer.has(playerId)) {
      byPlayer.set(playerId, { name: playerName, tables: [] })
    }
    byPlayer.get(playerId)!.tables.push(tableName)
  }

  // Build reference for each player
  const parts: string[] = []
  for (const { name, tables } of byPlayer.values()) {
    parts.push(`${name} - ${tables.join(', ')}`)
  }

  let reference = parts.join(' | ')

  // Truncate if too long
  if (reference.length > MAX_REFERENCE_LENGTH) {
    reference = reference.substring(0, MAX_REFERENCE_LENGTH - 3) + '...'
  }

  return reference
}
