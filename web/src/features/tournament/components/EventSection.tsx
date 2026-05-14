import { QRCodeSVG } from 'qrcode.react'
import { ExternalLinkIcon } from 'lucide-react'
import { MarkdownRenderer } from '@components/ui/markdown-renderer'

interface EventSectionProps {
  tournament: {
    startDate: string
    endDate: string
    eventResultUrl: string | null
    eventContent: string | null
  }
}

export function EventSection({ tournament }: EventSectionProps) {
  const hasResultUrl = !!tournament.eventResultUrl
  const hasContent = !!tournament.eventContent

  if (!hasResultUrl && !hasContent) return null

  const dateRange = (() => {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    return tournament.startDate === tournament.endDate
      ? fmt(tournament.startDate)
      : `${fmt(tournament.startDate)} — ${fmt(tournament.endDate)}`
  })()

  return (
    <div className="bg-card border-4 border-foreground neo-brutal-lg overflow-hidden">
      {/* Barre de titre */}
      <div className="bg-destructive text-destructive-foreground px-4 py-2 flex justify-between items-center">
        <span className="font-black text-sm tracking-widest uppercase">🏓 Tournoi en cours</span>
        <span className="text-sm font-bold">{dateRange}</span>
      </div>

      {/* Zone résultats + QR code */}
      {hasResultUrl && (
        <div className="flex items-center gap-4 p-4">
          <div className="flex-shrink-0">
            <QRCodeSVG value={tournament.eventResultUrl!} size={72} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-base mb-1">📊 Résultats en direct</div>
            <p className="text-sm text-muted-foreground mb-3">
              Scannez le QR code ou cliquez pour suivre l'avancement du tournoi
            </p>
            <a
              href={tournament.eventResultUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-accent px-3 py-1 neo-brutal-sm font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Voir les résultats
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Bande de contenu markdown */}
      {hasContent && (
        <div
          data-testid="event-content"
          className="border-t-2 border-foreground px-4 py-3 bg-muted/30"
        >
          <MarkdownRenderer content={tournament.eventContent!} />
        </div>
      )}
    </div>
  )
}
