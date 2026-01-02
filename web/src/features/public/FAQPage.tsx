import { usePublicTournaments } from './hooks'
import { FAQ } from '../../components/ui/faq'

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
                <p className="text-muted-foreground font-bold text-xl">Aucune question n'a encore été ajoutée pour ce tournoi.</p>
            </div>
        )
    }

    const sortedItems = [...faqItems].sort((a, b) => (a.order || 0) - (b.order || 0))

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                    Foire Aux <span className="text-primary">Questions</span>
                </h1>
                <p className="text-xl font-bold text-muted-foreground">
                    Les questions les plus fréquentes sur le tournoi
                </p>
            </div>

            <FAQ items={sortedItems} />
        </div>
    )
}
