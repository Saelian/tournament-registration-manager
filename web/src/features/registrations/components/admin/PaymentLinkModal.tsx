import { useState } from 'react'
import { Copy, Check, Loader2, Link2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/ui/dialog'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'

interface PaymentLinkModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    checkoutUrl: string | null
    isLoading?: boolean
    error?: string | null
}

export function PaymentLinkModal({
    open,
    onOpenChange,
    checkoutUrl,
    isLoading = false,
    error = null,
}: PaymentLinkModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (!checkoutUrl) return
        await navigator.clipboard.writeText(checkoutUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] neo-brutal">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="h-5 w-5" />
                        Lien de paiement
                    </DialogTitle>
                    <DialogDescription>
                        Copiez ce lien et envoyez-le au joueur pour qu'il puisse effectuer le paiement.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Génération du lien...</span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 border-2 border-destructive p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {checkoutUrl && !isLoading && (
                        <div className="space-y-2">
                            <Label>Lien de paiement HelloAsso</Label>
                            <div className="flex gap-2">
                                <Input value={checkoutUrl} readOnly className="font-mono text-sm" />
                                <Button onClick={handleCopy} variant="secondary">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Ce lien est valable pendant 24 heures.</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={() => onOpenChange(false)}>Fermer</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
