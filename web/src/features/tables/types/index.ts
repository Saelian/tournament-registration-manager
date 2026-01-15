import { z } from 'zod'

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

export const tableSchema = z
    .object({
        name: z.string().min(1, 'Le nom est requis'),
        referenceLetter: z.string().max(5, 'Maximum 5 caractères').nullable().default(null),
        date: z.string().min(1, 'La date est requise'),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:mm invalide'),
        pointsMin: z.coerce.number().min(0, 'Minimum 0'),
        pointsMax: z.coerce.number().min(0, 'Minimum 0'),
        quota: z.coerce.number().min(1, 'Minimum 1'),
        price: z.coerce.number().min(0, 'Minimum 0'),
        isSpecial: z.boolean().default(false),
        nonNumberedOnly: z.boolean().default(false),
        genderRestriction: z.enum(['M', 'F']).nullable().default(null),
        allowedCategories: z.array(z.enum(FFTT_CATEGORIES)).nullable().default(null),
        maxCheckinTime: z
            .string()
            .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
            .nullable()
            .default(null),
        prizes: z
            .array(
                z.object({
                    rank: z.number().min(1),
                    prizeType: z.enum(['cash', 'item']),
                    cashAmount: z.number().nullable(),
                    itemDescription: z.string().nullable(),
                })
            )
            .optional(),
        sponsorIds: z.array(z.number()).optional(),
    })
    .refine((data) => data.pointsMax >= data.pointsMin, {
        message: 'Le max doit être supérieur ou égal au min',
        path: ['pointsMax'],
    })

export type TableFormData = z.infer<typeof tableSchema>

export interface TablePrize {
    id: number
    rank: number
    prizeType: 'cash' | 'item'
    cashAmount: number | null
    itemDescription: string | null
}

export interface TableSponsor {
    id: number
    name: string
    websiteUrl: string | null
    isGlobal: boolean
}

export interface Table {
    id: number
    name: string
    referenceLetter: string | null
    date: string
    startTime: string
    pointsMin: number
    pointsMax: number
    quota: number
    price: number
    isSpecial: boolean
    nonNumberedOnly: boolean
    genderRestriction: GenderRestriction
    allowedCategories: FfttCategory[] | null
    maxCheckinTime: string | null
    effectiveCheckinTime: string
    registeredCount: number
    waitlistCount: number
    prizes: TablePrize[]
    sponsors: TableSponsor[]
    totalCashPrize: number
}

export interface EligibleTable extends Table {
    isEligible: boolean
    ineligibilityReasons: string[]
}

// CSV Import types
export interface CsvValidationError {
    field: string
    message: string
}

export interface CsvParsedPrize {
    rank: number
    prizeType: 'cash' | 'item'
    cashAmount: number | null
    itemDescription: string | null
}

export interface CsvParsedTableData {
    name: string
    referenceLetter: string | null
    date: string
    startTime: string
    pointsMin: number
    pointsMax: number
    quota: number
    price: number
    isSpecial: boolean
    nonNumberedOnly: boolean
    genderRestriction: GenderRestriction
    allowedCategories: FfttCategory[] | null
    maxCheckinTime: string | null
    prizes: CsvParsedPrize[]
}

export interface CsvParsedRow {
    rowNumber: number
    isValid: boolean
    data: CsvParsedTableData | null
    errors: CsvValidationError[]
}

export interface CsvPreviewResponse {
    totalRows: number
    validRows: number
    invalidRows: number
    rows: CsvParsedRow[]
}

export interface CsvConfirmResponse {
    imported: number
    tables: { id: number; name: string }[]
}
