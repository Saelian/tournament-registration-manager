import { useState, useCallback } from 'react'
import { api } from '@lib/api'
import type { ExportColumn, CsvSeparator } from './CsvExportModal'

interface ExportConfig {
    columns: ExportColumn[]
    separator: CsvSeparator
}

interface UseExportCsvOptions {
    endpoint: string
    filenamePrefix: string
    additionalParams?: Record<string, unknown>
}

/**
 * Hook générique pour l'export CSV
 * Gère l'appel API et le téléchargement du fichier
 */
export function useExportCsv({ endpoint, filenamePrefix, additionalParams = {} }: UseExportCsvOptions) {
    const [isExporting, setIsExporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const exportCsv = useCallback(
        async (config: ExportConfig) => {
            setIsExporting(true)
            setError(null)

            try {
                const response = await api.post(
                    endpoint,
                    {
                        columns: config.columns,
                        separator: config.separator,
                        ...additionalParams,
                    },
                    {
                        responseType: 'blob',
                    }
                )

                // Créer un lien de téléchargement
                const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url

                // Construire le nom du fichier avec la date
                const date = new Date().toISOString().split('T')[0]
                link.download = `${filenamePrefix}-${date}.csv`

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(url)
            } catch (err) {
                console.error('Export CSV error:', err)
                setError("Une erreur est survenue lors de l'export")
                throw err
            } finally {
                setIsExporting(false)
            }
        },
        [endpoint, filenamePrefix, additionalParams]
    )

    return {
        exportCsv,
        isExporting,
        error,
    }
}
