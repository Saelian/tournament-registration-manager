export const FFTT_CATEGORIES = [
  'Poussin',
  'Benjamin',
  'Minime',
  'Cadet',
  'Junior',
  'Senior',
  'Vétéran 1',
  'Vétéran 2',
  'Vétéran 3',
  'Vétéran 4',
  'Vétéran 5',
] as const

export type FfttCategory = (typeof FFTT_CATEGORIES)[number]

/**
 * Mapping des codes courts FFTT (retournés par l'API) vers les noms complets.
 */
const FFTT_CATEGORY_CODE_MAP: Record<string, FfttCategory> = {
  P1: 'Poussin',
  P2: 'Poussin',
  B1: 'Benjamin',
  B2: 'Benjamin',
  M1: 'Minime',
  M2: 'Minime',
  C1: 'Cadet',
  C2: 'Cadet',
  J1: 'Junior',
  J2: 'Junior',
  J3: 'Junior',
  S: 'Senior',
  V1: 'Vétéran 1',
  V2: 'Vétéran 2',
  V3: 'Vétéran 3',
  V4: 'Vétéran 4',
  V5: 'Vétéran 5',
}

/**
 * Normalise un code catégorie FFTT (ex: "B1") vers le nom complet (ex: "Benjamin").
 * Si la valeur est déjà un nom complet ou est inconnue, elle est retournée telle quelle.
 */
export function normalizeFfttCategory(raw: string): string {
  return FFTT_CATEGORY_CODE_MAP[raw] ?? raw
}

export type GenderRestriction = 'M' | 'F' | null
