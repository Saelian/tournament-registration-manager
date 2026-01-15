import { ClockIcon, XCircle } from 'lucide-react'
import type { RegistrationStatus } from '../types'

interface RegistrationStatusAlertProps {
    status: RegistrationStatus
}

export function RegistrationStatusAlert({ status }: RegistrationStatusAlertProps) {
    if (status.isOpen) return null

    return (
        <div className="animate-on-load animate-scale-in animation-delay-200 mb-6 p-4 bg-card neo-brutal">
            <div className="flex items-center gap-3">
                {status.status === 'not_started' ? (
                    <ClockIcon className="w-6 h-6 text-muted-foreground" />
                ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                )}
                <div>
                    <div className="font-bold text-lg">
                        {status.status === 'not_started'
                            ? 'Les inscriptions ne sont pas encore ouvertes'
                            : 'Les inscriptions sont terminées'}
                    </div>
                    <div className="text-muted-foreground">{status.message}</div>
                </div>
            </div>
        </div>
    )
}
