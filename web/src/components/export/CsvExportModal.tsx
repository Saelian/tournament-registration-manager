import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'

export type CsvSeparator = ';' | ',' | '\t'

export interface ExportColumn {
  key: string
  label: string
  included: boolean
}

interface CsvExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  columns: ExportColumn[]
  onExport: (config: {
    columns: ExportColumn[]
    separator: CsvSeparator
    presentOnly?: boolean
  }) => Promise<void>
  isExporting?: boolean
  showPresentOnlyOption?: boolean
}

const separatorOptions: { value: CsvSeparator; label: string }[] = [
  { value: ';', label: 'Point-virgule (;)' },
  { value: ',', label: 'Virgule (,)' },
  { value: '\t', label: 'Tabulation' },
]

export function CsvExportModal({
  open,
  onOpenChange,
  title,
  columns: initialColumns,
  onExport,
  isExporting = false,
  showPresentOnlyOption = false,
}: CsvExportModalProps) {
  const [columns, setColumns] = useState<ExportColumn[]>(initialColumns)
  const [separator, setSeparator] = useState<CsvSeparator>(';')
  const [presentOnly, setPresentOnly] = useState(false)

  // Réinitialiser les colonnes quand la modal s'ouvre
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setColumns(initialColumns)
      setPresentOnly(false)
    }
    onOpenChange(newOpen)
  }

  const handleColumnToggle = (key: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, included: !col.included } : col))
    )
  }

  const handleLabelChange = (key: string, newLabel: string) => {
    setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, label: newLabel } : col)))
  }

  const handleSelectAll = () => {
    const allSelected = columns.every((col) => col.included)
    setColumns((prev) => prev.map((col) => ({ ...col, included: !allSelected })))
  }

  const handleExport = async () => {
    await onExport({
      columns,
      separator,
      presentOnly: showPresentOnlyOption ? presentOnly : undefined,
    })
  }

  const selectedCount = columns.filter((col) => col.included).length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Configurez les colonnes et le format d'export</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sélection des colonnes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Colonnes ({selectedCount}/{columns.length})
              </Label>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {columns.every((col) => col.included) ? 'Désélectionner tout' : 'Tout sélectionner'}
              </Button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto border-2 border-foreground p-3 rounded-lg">
              {columns.map((col) => (
                <div key={col.key} className="flex items-center gap-3">
                  <Checkbox
                    id={`col-${col.key}`}
                    checked={col.included}
                    onChange={() => handleColumnToggle(col.key)}
                  />
                  <Input
                    value={col.label}
                    onChange={(e) => handleLabelChange(col.key, e.target.value)}
                    className="flex-1 h-8 text-sm"
                    disabled={!col.included}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Choix du séparateur */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Séparateur</Label>
            <div className="flex gap-2 flex-wrap">
              {separatorOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={separator === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeparator(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Option présents uniquement */}
          {showPresentOnlyOption && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Filtres</Label>
              <div className="flex items-center gap-3 p-3 border-2 border-foreground rounded-lg bg-green-50">
                <Checkbox
                  id="present-only"
                  checked={presentOnly}
                  onChange={() => setPresentOnly(!presentOnly)}
                />
                <label htmlFor="present-only" className="text-sm font-medium cursor-pointer">
                  Exporter uniquement les joueurs présents (pointés)
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={selectedCount === 0 || isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
