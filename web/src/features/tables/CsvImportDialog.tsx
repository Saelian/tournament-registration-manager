import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { CsvDropzone } from './CsvDropzone'
import { CsvPreviewTable } from './CsvPreviewTable'
import { usePreviewCsvImport, useConfirmCsvImport } from './hooks'
import type { CsvPreviewResponse } from './types'

interface CsvImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CsvImportDialog({ open, onOpenChange, onSuccess }: CsvImportDialogProps) {
  const [previewData, setPreviewData] = useState<CsvPreviewResponse | null>(null)

  const previewMutation = usePreviewCsvImport()
  const confirmMutation = useConfirmCsvImport()

  const handleFileSelect = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    previewMutation.mutate(formData, {
      onSuccess: (data) => {
        setPreviewData(data)
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Erreur lors de l'analyse du fichier")
      },
    })
  }

  const handleConfirm = () => {
    if (!previewData) return

    const validRows = previewData.rows.filter((r) => r.isValid).map((r) => r.data!)

    confirmMutation.mutate(validRows, {
      onSuccess: (data) => {
        toast.success(`${data.imported} tableau${data.imported > 1 ? 'x' : ''} importé${data.imported > 1 ? 's' : ''} avec succès`)
        handleClose()
        onSuccess()
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Erreur lors de l'import")
      },
    })
  }

  const handleClose = () => {
    setPreviewData(null)
    previewMutation.reset()
    confirmMutation.reset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setPreviewData(null)
    previewMutation.reset()
  }

  const validCount = previewData?.validRows ?? 0
  const invalidCount = previewData?.invalidRows ?? 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer des tableaux</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!previewData && (
            <CsvDropzone onFileSelect={handleFileSelect} isLoading={previewMutation.isPending} />
          )}

          {previewData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-green-600">{validCount}</span>
                    <span className="text-muted-foreground">
                      tableau{validCount > 1 ? 'x' : ''} valide{validCount > 1 ? 's' : ''}
                    </span>
                  </span>
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-destructive">{invalidCount}</span>
                      <span className="text-muted-foreground">
                        erreur{invalidCount > 1 ? 's' : ''}
                      </span>
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Changer de fichier
                </Button>
              </div>

              <CsvPreviewTable rows={previewData.rows} />

              {invalidCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Seuls les tableaux valides seront importés. Cliquez sur une ligne pour voir les
                  détails.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          {previewData && (
            <Button onClick={handleConfirm} disabled={validCount === 0 || confirmMutation.isPending}>
              {confirmMutation.isPending
                ? 'Import en cours...'
                : `Importer ${validCount} tableau${validCount > 1 ? 'x' : ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
