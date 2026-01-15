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

export type GenderRestriction = 'M' | 'F' | null
