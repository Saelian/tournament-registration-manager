import { useState } from 'react'
import { Button } from '@components/ui/button'
import { useSponsors, useCreateSponsor, useUpdateSponsor, useDeleteSponsor } from './hooks'
import { SponsorForm } from './SponsorForm'
import type { Sponsor, SponsorFormData } from './types'
import { Trash2Icon, EditIcon, PlusIcon, GlobeIcon, MailIcon } from 'lucide-react'

export function SponsorListPage() {
  const { data: sponsors, isLoading } = useSponsors()
  const createMutation = useCreateSponsor()
  const updateMutation = useUpdateSponsor()
  const deleteMutation = useDeleteSponsor()

  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = (data: SponsorFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreating(false)
      },
    })
  }

  const handleUpdate = (data: SponsorFormData) => {
    if (selectedSponsor) {
      updateMutation.mutate(
        { id: selectedSponsor.id, data },
        {
          onSuccess: () => {
            setSelectedSponsor(null)
          },
        }
      )
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (isCreating || selectedSponsor) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <SponsorForm
          initialData={selectedSponsor}
          onSubmit={selectedSponsor ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsCreating(false)
            setSelectedSponsor(null)
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 animate-on-load animate-slide-up">
      <div className="flex justify-between items-center mb-6 border-b-4 border-foreground pb-4">
        <h1 className="text-3xl font-bold">Sponsors</h1>
        <Button onClick={() => setIsCreating(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau Sponsor
        </Button>
      </div>

      <div className="grid gap-4">
        {sponsors?.map((sponsor) => (
          <div
            key={sponsor.id}
            className="bg-card p-4 neo-brutal flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-xl font-bold">{sponsor.name}</h3>
                {sponsor.isGlobal && (
                  <span className="bg-yellow-300 text-xs px-2 py-1 font-bold border border-foreground rounded">
                    Global
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {sponsor.websiteUrl && (
                  <a
                    href={sponsor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <GlobeIcon className="w-3 h-3" />
                    Site web
                  </a>
                )}
                {sponsor.contactEmail && (
                  <a
                    href={`mailto:${sponsor.contactEmail}`}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <MailIcon className="w-3 h-3" />
                    {sponsor.contactEmail}
                  </a>
                )}
              </div>

              {sponsor.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {sponsor.description}
                </p>
              )}

              {sponsor.tables.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-bold text-muted-foreground">Tableaux:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sponsor.tables.map((table) => (
                      <span
                        key={table.id}
                        className="bg-secondary text-xs px-2 py-0.5 border border-foreground rounded"
                      >
                        {table.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex md:flex-col justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedSponsor(sponsor)}>
                <EditIcon className="w-4 h-4" />
              </Button>
              <Button
                className="bg-white text-black"
                size="sm"
                onClick={() => handleDelete(sponsor.id)}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {sponsors?.length === 0 && (
          <div className="text-center p-8 bg-secondary border-2 border-dashed border-foreground">
            <p className="font-bold text-muted-foreground">Aucun sponsor.</p>
          </div>
        )}
      </div>
    </div>
  )
}
