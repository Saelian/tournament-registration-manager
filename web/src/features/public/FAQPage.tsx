import { usePublicTournaments } from './hooks'
import { FAQ } from '../../components/ui/faq'
import { Link } from 'react-router-dom'
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
      <div className="mb-8">
        <Link
          to="/"
          className="animate-on-load animate-slide-in-left text-primary hover:underline text-sm mb-4 inline-block"
        >
          ← Retour à l'accueil
        </Link>
        <h1 className="animate-on-load animate-slide-in-left animation-delay-100 text-3xl font-black mb-2 flex items-center gap-3">
          <HelpCircle className="h-8 w-8" />
          Questions fréquentes
        </h1>
      </div>

      <div className="animate-on-load animate-slide-up animation-delay-200">
        <FAQ items={sortedItems} />
      </div>
    </div>
  )
}
