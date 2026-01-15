import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Label } from '@components/ui/label'
import { useProcessRefund } from '../../hooks'
import { formatPrice } from '../../../../lib/formatters'
import type { PaymentData, RefundMethod } from '../../types'

interface ProcessRefundModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    payment: PaymentData | null
}

const refundMethods: { value: RefundMethod; label: string; description: string }[] = [
    {
        value: 'helloasso_manual',
        label: 'Remboursement depuis la plateforme HelloAsso',
        description: 'Le remboursement a été effectué manuellement sur HelloAsso',
    },
    {
        value: 'bank_transfer',
        label: 'Virement bancaire',
        description: 'Le remboursement a été fait par virement bancaire',
    },
    {
        value: 'cash',
        label: 'Espèces',
        description: 'Le remboursement a été fait en espèces',
    },
]

export function ProcessRefundModal({ open, onOpenChange, payment }: ProcessRefundModalProps) {
    const [selectedMethod, setSelectedMethod] = useState<RefundMethod>('helloasso_manual')
    const processRefund = useProcessRefund()

    const handleSubmit = async () => {
        if (!payment) return

        await processRefund.mutateAsync({
            paymentId: payment.id,
            refundMethod: selectedMethod,
        })

        onOpenChange(false)
    }

    if (!payment) return null

    const subscriberName =
        payment.subscriber.firstName || payment.subscriber.lastName
            ? `${payment.subscriber.firstName ?? ''} ${payment.subscriber.lastName ?? ''}`.trim()
            : payment.subscriber.email

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Traiter le remboursement</DialogTitle>
                    <DialogDescription>
                        Confirmer le traitement du remboursement pour {subscriberName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Avertissement */}
                    <div className="bg-orange-100 border-2 border-orange-500 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-orange-900">Important</p>
                                <p className="text-sm text-orange-800">
                                    En validant, vous confirmez que le remboursement a été effectué en amont
                                    (manuellement sur HelloAsso, par virement, en espèces...).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Récapitulatif */}
                    <div className="bg-secondary/30 border-2 border-foreground/20 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Montant à rembourser</p>
                        <p className="text-2xl font-bold">{formatPrice(payment.amount / 100)} €</p>
                    </div>

                    {/* Sélection du mode */}
                    <div className="space-y-3">
                        <Label>Mode de remboursement</Label>
                        <div className="space-y-2">
                            {refundMethods.map((method) => (
                                <label
                                    key={method.value}
                                    className={`flex items-start gap-3 p-3 border-2 cursor-pointer transition-colors ${
                                        selectedMethod === method.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-foreground/20 hover:border-foreground/40'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="refundMethod"
                                        value={method.value}
                                        checked={selectedMethod === method.value}
                                        onChange={() => setSelectedMethod(method.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <p className="font-medium">{method.label}</p>
                                        <p className="text-sm text-muted-foreground">{method.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={processRefund.isPending}>
                        {processRefund.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirmer le remboursement
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
