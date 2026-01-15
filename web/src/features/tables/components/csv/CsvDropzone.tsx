import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, Download } from 'lucide-react'
import { cn } from '@lib/utils'
import { api } from '@lib/api'

interface CsvDropzoneProps {
    onFileSelect: (file: File) => void
    isLoading: boolean
}

export function CsvDropzone({ onFileSelect, isLoading }: CsvDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownloadTemplate = useCallback(async () => {
        setIsDownloading(true)
        try {
            const response = await api.get('/admin/tables/import/template', {
                responseType: 'blob',
                transformResponse: [(data) => data], // Skip the normal JSON parsing
            })

            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'template_tableaux.csv'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch {
            setError('Erreur lors du téléchargement du template')
        } finally {
            setIsDownloading(false)
        }
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const validateAndSelectFile = useCallback(
        (file: File) => {
            setError(null)

            if (!file.name.toLowerCase().endsWith('.csv')) {
                setError('Seuls les fichiers CSV sont acceptés')
                return
            }

            if (file.size > 2 * 1024 * 1024) {
                setError('Le fichier ne doit pas dépasser 2 Mo')
                return
            }

            onFileSelect(file)
        },
        [onFileSelect]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)

            const file = e.dataTransfer.files[0]
            if (file) {
                validateAndSelectFile(file)
            }
        },
        [validateAndSelectFile]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                validateAndSelectFile(file)
            }
        },
        [validateAndSelectFile]
    )

    return (
        <div className="space-y-4">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                    isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary/50',
                    isLoading && 'opacity-50 pointer-events-none'
                )}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    id="csv-file-input"
                    disabled={isLoading}
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-4">
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                                <p className="text-muted-foreground">Analyse du fichier en cours...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-4 bg-primary/10 rounded-full">
                                    {isDragging ? (
                                        <FileSpreadsheet className="h-8 w-8 text-primary" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier CSV'}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        ou cliquez pour sélectionner un fichier (max 2 Mo)
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <div className="text-sm text-muted-foreground">
                <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium disabled:opacity-50"
                >
                    <Download className="h-4 w-4" />
                    {isDownloading ? 'Téléchargement...' : 'Télécharger le template CSV'}
                </button>
            </div>
        </div>
    )
}
