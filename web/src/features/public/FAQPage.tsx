import { usePublicTournaments } from './hooks'
import { FAQ } from '@components/ui/faq'
import { PageHeader } from '@components/ui/page-header'
import { HelpCircle } from 'lucide-react'

export function FAQPage() {
  const { data: tournaments, isLoading } = usePublicTournaments()
  const activeTournament = tournaments?.[0]

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-bold animate-pulse">Chargement...</div>
      </div>
    )
  }

  const faqItems = activeTournament?.options?.faqItems || []

  if (!faqItems || faqItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
          Foire Aux Questions
        </h1>
        <p className="text-muted-foreground font-bold text-xl">
          Aucune question n'a encore été ajoutée pour ce tournoi.
        </p>
      </div>
    )
  }

  const sortedItems = [...faqItems].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="max-w-7xl mx-auto p-6 py-12">
      <PageHeader
        title="Questions fréquentes"
        icon={HelpCircle}
        backLink="/"
      />

      <div className="animate-on-load animate-slide-up animation-delay-200">
        <FAQ items={sortedItems} />
      </div>
    </div>
  )
}
