import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { useSyncTableSponsors, useTableSponsors } from './hooks'
import { useSponsors } from '../sponsors/hooks'
import { UsersIcon, CheckIcon, XIcon } from 'lucide-react'

interface TableSponsorsSectionProps {
  tableId?: number
  value?: number[]
  onChange?: (ids: number[]) => void
}

export function TableSponsorsSection({ tableId, value = [], onChange }: TableSponsorsSectionProps) {
  const { data: connectedSponsors = [] } = useTableSponsors(tableId ?? null)
  const { data: allSponsors } = useSponsors()
  const syncMutation = useSyncTableSponsors()

  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Determine current sponsors list
  const currentSponsors = tableId
    ? connectedSponsors
    : (allSponsors?.filter((s) => value.includes(s.id)) ?? [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds(currentSponsors.map((s) => s.id))
  }, [currentSponsors])

  const handleEdit = () => {
    setSelectedIds(currentSponsors.map((s) => s.id))
    setIsEditing(true)
  }

  const handleSave = () => {
    if (tableId) {
      syncMutation.mutate(
        { tableId, sponsorIds: selectedIds },
        {
          onSuccess: () => {
            setIsEditing(false)
          },
        }
      )
    } else {
      // Draft mode
      if (onChange) {
        onChange(selectedIds)
        setIsEditing(false)
      }
    }
  }

  const handleCancel = () => {
    setSelectedIds(currentSponsors.map((s) => s.id))
    setIsEditing(false)
  }

  const toggleSponsor = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const isLoading = tableId ? syncMutation.isPending : false

  return (
    <div className="border-t-2 border-foreground pt-4 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold flex items-center gap-2">
          <UsersIcon className="w-4 h-4" />
          Sponsors associés
        </h3>
        {!isEditing && (
          <Button type="button" variant="secondary" size="sm" onClick={handleEdit}>
            Modifier
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {allSponsors && allSponsors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allSponsors.map((sponsor) => (
                <label
                  key={sponsor.id}
                  className={`flex items-center gap-2 p-2 rounded border-2 cursor-pointer transition-colors ${
                    selectedIds.includes(sponsor.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-foreground bg-secondary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(sponsor.id)}
                    onChange={() => toggleSponsor(sponsor.id)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">{sponsor.name}</span>
                  {sponsor.isGlobal && (
                    <span className="text-xs bg-yellow-300 px-1 rounded">Global</span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun sponsor disponible.{' '}
              <a href="/admin/sponsors" className="underline">
                Créer un sponsor
              </a>
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" size="sm" onClick={handleSave} disabled={isLoading}>
              <CheckIcon className="w-4 h-4 mr-1" />
              Enregistrer
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
              <XIcon className="w-4 h-4 mr-1" />
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {currentSponsors.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentSponsors.map((sponsor) => (
                <span
                  key={sponsor.id}
                  className="bg-secondary text-sm px-2 py-1 border border-foreground rounded flex items-center gap-1"
                >
                  {sponsor.name}
                  {sponsor.isGlobal && (
                    <span className="text-xs bg-yellow-300 px-1 rounded">Global</span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun sponsor associé</p>
          )}
        </div>
      )}
    </div>
  )
}
