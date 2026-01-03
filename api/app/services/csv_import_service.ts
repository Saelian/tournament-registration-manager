import { FFTT_CATEGORIES, type FfttCategory, type GenderRestriction } from '#constants/fftt'

interface CsvRow {
  [key: string]: string
}

interface ParsedPrize {
  rank: number
  prizeType: 'cash' | 'item'
  cashAmount: number | null
  itemDescription: string | null
}

interface ParsedTableData {
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
  prizes: ParsedPrize[]
}

interface ValidationError {
  field: string
  message: string
}

export interface ParsedRow {
  rowNumber: number
  isValid: boolean
  data: ParsedTableData | null
  errors: ValidationError[]
}

const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

class CsvImportService {
  /**
   * Parse le contenu CSV brut en tableau d'objets
   */
  parse(content: string): CsvRow[] {
    // Supprimer le BOM UTF-8 si présent
    const cleanContent = content.replace(/^\uFEFF/, '')

    const lines = cleanContent.split(/\r?\n/).filter((line) => line.trim() !== '')

    if (lines.length < 2) {
      return []
    }

    const headers = this.parseCsvLine(lines[0])
    const rows: CsvRow[] = []

    for (const line of lines.slice(1)) {
      const values = this.parseCsvLine(line)
      const row: CsvRow = {}

      for (const [index, header] of headers.entries()) {
        row[header.trim()] = (values[index] || '').trim()
      }

      rows.push(row)
    }

    return rows
  }

  /**
   * Parse une ligne CSV en tenant compte des guillemets
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }

  /**
   * Valide et transforme une ligne CSV
   */
  validateRow(row: CsvRow, rowNumber: number): ParsedRow {
    const errors: ValidationError[] = []

    // Champs obligatoires
    const name = row['name']?.trim()
    if (!name) {
      errors.push({ field: 'name', message: 'Le nom est requis' })
    }

    // Champ optionnel: lettre de référence
    const referenceLetter = row['referenceLetter']?.trim() || null
    if (referenceLetter && referenceLetter.length > 5) {
      errors.push({
        field: 'referenceLetter',
        message: 'La lettre de référence ne peut pas dépasser 5 caractères',
      })
    }

    const date = row['date']?.trim()
    if (!date) {
      errors.push({ field: 'date', message: 'La date est requise' })
    } else if (!DATE_REGEX.test(date)) {
      errors.push({ field: 'date', message: 'Format de date invalide (YYYY-MM-DD attendu)' })
    }

    const startTime = row['startTime']?.trim()
    if (!startTime) {
      errors.push({ field: 'startTime', message: "L'heure de début est requise" })
    } else if (!TIME_REGEX.test(startTime)) {
      errors.push({ field: 'startTime', message: "Format d'heure invalide (HH:mm attendu)" })
    }

    const pointsMin = this.parseNumber(row['pointsMin'])
    if (pointsMin === null) {
      errors.push({ field: 'pointsMin', message: 'Points min doit être un nombre' })
    } else if (pointsMin < 0) {
      errors.push({ field: 'pointsMin', message: 'Points min ne peut pas être négatif' })
    }

    const pointsMax = this.parseNumber(row['pointsMax'])
    if (pointsMax === null) {
      errors.push({ field: 'pointsMax', message: 'Points max doit être un nombre' })
    } else if (pointsMax < 0) {
      errors.push({ field: 'pointsMax', message: 'Points max ne peut pas être négatif' })
    }

    if (pointsMin !== null && pointsMax !== null && pointsMax < pointsMin) {
      errors.push({ field: 'pointsMax', message: 'Points max doit être >= points min' })
    }

    const quota = this.parseNumber(row['quota'])
    if (quota === null) {
      errors.push({ field: 'quota', message: 'Quota doit être un nombre' })
    } else if (quota < 1) {
      errors.push({ field: 'quota', message: 'Quota doit être au minimum 1' })
    }

    const price = this.parseNumber(row['price'])
    if (price === null) {
      errors.push({ field: 'price', message: 'Prix doit être un nombre' })
    } else if (price < 0) {
      errors.push({ field: 'price', message: 'Prix ne peut pas être négatif' })
    }

    // Champs optionnels
    const isSpecial = this.parseBoolean(row['isSpecial'])
    const nonNumberedOnly = this.parseBoolean(row['nonNumberedOnly'])

    const genderRestriction = this.parseGenderRestriction(row['genderRestriction'])
    if (row['genderRestriction']?.trim() && genderRestriction === undefined) {
      errors.push({ field: 'genderRestriction', message: 'Valeur autorisée: M, F ou vide' })
    }

    const allowedCategories = this.parseCategories(row['allowedCategories'])
    if (allowedCategories === undefined && row['allowedCategories']?.trim()) {
      errors.push({
        field: 'allowedCategories',
        message: 'Catégorie(s) non reconnue(s). Valeurs autorisées: ' + FFTT_CATEGORIES.join(', '),
      })
    }

    const maxCheckinTime = row['maxCheckinTime']?.trim() || null
    if (maxCheckinTime && !TIME_REGEX.test(maxCheckinTime)) {
      errors.push({
        field: 'maxCheckinTime',
        message: "Format d'heure invalide (HH:mm attendu)",
      })
    }

    // Extraction des prizes
    const prizes = this.extractPrizes(row, errors)

    if (errors.length > 0) {
      return { rowNumber, isValid: false, data: null, errors }
    }

    return {
      rowNumber,
      isValid: true,
      data: {
        name: name!,
        referenceLetter,
        date: date!,
        startTime: startTime!,
        pointsMin: pointsMin!,
        pointsMax: pointsMax!,
        quota: quota!,
        price: price!,
        isSpecial,
        nonNumberedOnly,
        genderRestriction: genderRestriction ?? null,
        allowedCategories: allowedCategories ?? null,
        maxCheckinTime: maxCheckinTime && TIME_REGEX.test(maxCheckinTime) ? maxCheckinTime : null,
        prizes,
      },
      errors: [],
    }
  }

  /**
   * Extrait les prizes des colonnes prize_N_*
   */
  private extractPrizes(row: CsvRow, errors: ValidationError[]): ParsedPrize[] {
    const prizes: ParsedPrize[] = []
    const prizeRanks = new Set<number>()

    // Chercher toutes les colonnes prize_N_type
    for (const key of Object.keys(row)) {
      const match = key.match(/^prize_(\d+)_type$/)
      if (match) {
        prizeRanks.add(Number.parseInt(match[1], 10))
      }
    }

    for (const rank of Array.from(prizeRanks).sort((a, b) => a - b)) {
      const prizeType = row[`prize_${rank}_type`]?.trim().toLowerCase()
      const amountStr = row[`prize_${rank}_amount`]?.trim()
      const description = row[`prize_${rank}_description`]?.trim()

      if (!prizeType) continue

      if (prizeType !== 'cash' && prizeType !== 'item') {
        errors.push({
          field: `prize_${rank}_type`,
          message: 'Type de dotation invalide (cash ou item)',
        })
        continue
      }

      let cashAmount: number | null = null
      let itemDescription: string | null = null

      if (prizeType === 'cash') {
        cashAmount = this.parseNumber(amountStr)
        if (cashAmount === null && amountStr) {
          errors.push({
            field: `prize_${rank}_amount`,
            message: 'Montant doit être un nombre',
          })
          continue
        }
        if (cashAmount !== null && cashAmount < 0) {
          errors.push({
            field: `prize_${rank}_amount`,
            message: 'Montant ne peut pas être négatif',
          })
          continue
        }
      } else {
        itemDescription = description || null
      }

      prizes.push({
        rank,
        prizeType: prizeType as 'cash' | 'item',
        cashAmount,
        itemDescription,
      })
    }

    return prizes
  }

  /**
   * Parse les catégories séparées par |
   */
  private parseCategories(value: string | undefined): FfttCategory[] | null | undefined {
    if (!value?.trim()) return null

    const categories = value.split('|').map((c) => c.trim())
    const validCategories: FfttCategory[] = []

    for (const cat of categories) {
      if (!cat) continue
      if ((FFTT_CATEGORIES as readonly string[]).includes(cat)) {
        validCategories.push(cat as FfttCategory)
      } else {
        return undefined // Indique une erreur
      }
    }

    return validCategories.length > 0 ? validCategories : null
  }

  /**
   * Parse une restriction de genre
   */
  private parseGenderRestriction(value: string | undefined): GenderRestriction | undefined {
    const trimmed = value?.trim().toUpperCase()
    if (!trimmed) return null
    if (trimmed === 'M' || trimmed === 'F') return trimmed
    return undefined // Indique une erreur
  }

  /**
   * Parse un nombre depuis une string
   */
  private parseNumber(value: string | undefined): number | null {
    if (!value?.trim()) return null
    const num = Number.parseFloat(value.replace(',', '.'))
    return Number.isNaN(num) ? null : num
  }

  /**
   * Parse un booléen depuis une string
   */
  private parseBoolean(value: string | undefined): boolean {
    const trimmed = value?.trim().toLowerCase()
    return trimmed === 'true' || trimmed === '1' || trimmed === 'oui' || trimmed === 'yes'
  }

  /**
   * Génère le template CSV
   */
  generateTemplate(): string {
    const headers = [
      'name',
      'referenceLetter',
      'date',
      'startTime',
      'pointsMin',
      'pointsMax',
      'quota',
      'price',
      'isSpecial',
      'nonNumberedOnly',
      'genderRestriction',
      'allowedCategories',
      'maxCheckinTime',
      'prize_1_type',
      'prize_1_amount',
      'prize_1_description',
      'prize_2_type',
      'prize_2_amount',
      'prize_2_description',
    ]

    const examples = [
      [
        'Tableau A - 1500pts',
        'A',
        '2025-03-15',
        '09:30',
        '0',
        '1500',
        '24',
        '8',
        'false',
        '',
        '',
        '',
        'cash',
        '100',
        '',
        'cash',
        '50',
        '',
      ],
      [
        'Minimes Filles',
        'B',
        '2025-03-16',
        '10:00',
        '0',
        '4000',
        '12',
        '6',
        'true',
        'F',
        'Minime|Benjamin',
        '09:45',
        'item',
        '',
        'Coupe 1er',
        'item',
        '',
        'Coupe 2ème',
      ],
    ]

    const lines = [headers.join(',')]
    for (const example of examples) {
      lines.push(example.map((v) => (v.includes(',') ? `"${v}"` : v)).join(','))
    }

    return lines.join('\n')
  }
}

export default new CsvImportService()
