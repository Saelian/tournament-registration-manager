import { Checkbox } from '@components/ui/checkbox'

interface TableFiltersProps {
    showEligibleOnly: boolean
    onShowEligibleOnlyChange: (value: boolean) => void
}

export function TableFilters({ showEligibleOnly, onShowEligibleOnlyChange }: TableFiltersProps) {
    return (
        <div className="flex flex-wrap gap-4 p-3 bg-card neo-brutal">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox checked={showEligibleOnly} onChange={(e) => onShowEligibleOnlyChange(e.target.checked)} />
                <span className="text-sm font-medium">Afficher uniquement les tableaux éligibles</span>
            </label>
        </div>
    )
}
