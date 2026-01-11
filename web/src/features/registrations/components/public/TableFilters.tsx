import { Checkbox } from '@components/ui/checkbox'

interface TableFiltersProps {
  showRegistered: boolean
  showEligibleOnly: boolean
  onShowRegisteredChange: (value: boolean) => void
  onShowEligibleOnlyChange: (value: boolean) => void
}

export function TableFilters({
  showRegistered,
  showEligibleOnly,
  onShowRegisteredChange,
  onShowEligibleOnlyChange,
}: TableFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-3 bg-secondary/50 border-2 border-foreground">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          checked={showRegistered}
          onChange={(e) => onShowRegisteredChange(e.target.checked)}
        />
        <span className="text-sm font-medium">Afficher les tableaux déjà inscrits</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <Checkbox
          checked={showEligibleOnly}
          onChange={(e) => onShowEligibleOnlyChange(e.target.checked)}
        />
        <span className="text-sm font-medium">Afficher uniquement les tableaux éligibles</span>
      </label>
    </div>
  )
}
