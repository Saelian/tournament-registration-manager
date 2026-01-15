/**
 * Service d'export CSV générique
 *
 * Génère des fichiers CSV avec support pour :
 * - Encodage UTF-8 avec BOM (compatibilité Excel)
 * - Séparateurs configurables
 * - Renommage des colonnes
 * - Sélection des colonnes
 */

export type CsvSeparator = ';' | ',' | '\t'

export interface ExportColumn {
    key: string // Clé du champ dans les données
    label: string // Nom de l'en-tête (personnalisable)
    included: boolean // Inclus dans l'export
}

export interface ExportConfig {
    columns: ExportColumn[]
    separator: CsvSeparator
}

class CsvExportService {
    /**
     * UTF-8 BOM pour la compatibilité Excel
     */
    private readonly UTF8_BOM = '\ufeff'

    /**
     * Génère le contenu CSV à partir des données
     *
     * @param data - Tableau d'objets à exporter
     * @param config - Configuration de l'export (colonnes, séparateur)
     * @returns Contenu CSV avec BOM UTF-8
     */
    generate<T extends Record<string, unknown>>(data: T[], config: ExportConfig): string {
        const { columns, separator } = config

        // Ne garder que les colonnes incluses
        const includedColumns = columns.filter((col) => col.included)

        if (includedColumns.length === 0) {
            throw new Error("Au moins une colonne doit être sélectionnée pour l'export")
        }

        // Générer l'en-tête
        const headerRow = includedColumns.map((col) => this.escapeValue(col.label, separator))

        // Générer les lignes de données
        const dataRows = data.map((item) =>
            includedColumns.map((col) => {
                const value = this.getNestedValue(item, col.key)
                return this.escapeValue(this.formatValue(value), separator)
            })
        )

        // Assembler le CSV avec BOM
        const lines = [headerRow.join(separator), ...dataRows.map((row) => row.join(separator))]

        return this.UTF8_BOM + lines.join('\r\n')
    }

    /**
     * Récupère une valeur imbriquée depuis un objet (supporte la notation pointée)
     */
    private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
        const keys = path.split('.')
        let value: unknown = obj

        for (const key of keys) {
            if (value === null || value === undefined) {
                return null
            }
            if (typeof value === 'object') {
                value = (value as Record<string, unknown>)[key]
            } else {
                return null
            }
        }

        return value
    }

    /**
     * Formate une valeur pour l'export CSV
     */
    private formatValue(value: unknown): string {
        if (value === null || value === undefined) {
            return ''
        }

        if (Array.isArray(value)) {
            // Joindre les tableaux avec une virgule
            return value.map((v) => this.formatValue(v)).join(',')
        }

        if (typeof value === 'boolean') {
            return value ? 'true' : 'false'
        }

        if (typeof value === 'number') {
            return String(value)
        }

        if (value instanceof Date) {
            return value.toISOString()
        }

        // Si c'est un objet avec toISODate (DateTime de Luxon)
        if (typeof value === 'object' && value !== null) {
            if ('toISODate' in value && typeof (value as { toISODate?: () => string }).toISODate === 'function') {
                return (value as { toISODate: () => string }).toISODate()
            }
            if ('toISO' in value && typeof (value as { toISO?: () => string }).toISO === 'function') {
                return (value as { toISO: () => string }).toISO()
            }
            // Autre objet : convertir en JSON
            return JSON.stringify(value)
        }

        return String(value)
    }

    /**
     * Échappe une valeur pour le CSV selon RFC 4180
     * - Entoure de guillemets si la valeur contient le séparateur, des guillemets ou des sauts de ligne
     * - Double les guillemets internes
     */
    private escapeValue(value: string, separator: CsvSeparator): string {
        const needsQuoting =
            value.includes(separator) || value.includes('"') || value.includes('\n') || value.includes('\r')

        if (needsQuoting) {
            // Doubler les guillemets et entourer
            return `"${value.replace(/"/g, '""')}"`
        }

        return value
    }

    /**
     * Génère le nom de fichier avec la date
     */
    generateFilename(prefix: string): string {
        const date = new Date().toISOString().split('T')[0]
        return `${prefix}-${date}.csv`
    }
}

export default new CsvExportService()
