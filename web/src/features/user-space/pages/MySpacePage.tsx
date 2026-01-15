import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { RegistrationsTabContent } from '../components/RegistrationsTabContent'
import { ProfileTabContent } from '../components/ProfileTabContent'
import { Calendar, UserCog } from 'lucide-react'

type TabValue = 'inscriptions' | 'infos'

export function MySpacePage() {
    const [searchParams, setSearchParams] = useSearchParams()

    const currentTab = (searchParams.get('tab') as TabValue) || 'inscriptions'

    const handleTabChange = (value: string) => {
        if (value === 'inscriptions') {
            // Retirer le paramètre tab pour l'onglet par défaut
            setSearchParams({})
        } else {
            setSearchParams({ tab: value })
        }
    }

    return (
        <div className="min-h-screen bg-grain overflow-x-hidden">
            <div className="bg-gradient-secondary-to-white min-h-screen">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-on-load animate-slide-up">
                    {/* Tabs */}
                    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="mb-6 w-full flex">
                            <TabsTrigger
                                value="inscriptions"
                                className="flex-1 gap-1 sm:gap-2 text-xs sm:text-base px-2 sm:px-4"
                            >
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Mes inscriptions</span>
                                <span className="sm:hidden">Inscriptions</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="infos"
                                className="flex-1 gap-1 sm:gap-2 text-xs sm:text-base px-2 sm:px-4"
                            >
                                <UserCog className="w-4 h-4 shrink-0" />
                                <span className="hidden sm:inline">Mes informations</span>
                                <span className="sm:hidden">Infos</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="inscriptions">
                            <RegistrationsTabContent />
                        </TabsContent>

                        <TabsContent value="infos">
                            <ProfileTabContent />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
