import { useState } from 'react'
import { User, Mail, Phone, CreditCard, LayoutList, ShieldCheck, Banknote, Trash2, Link2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@components/ui/dialog'
import { Badge, type BadgeVariant } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card'
import { toast } from 'sonner'
import type { AggregatedPlayerRow, RegistrationData, RegistrationGroup } from '../../types'
import { STATUS_BADGE_VARIANTS, REFUND_METHOD_LABELS } from '@constants/status-mappings'
import {
  formatDateShort,
  formatDateTimeLong,
  formatCurrency,
  getRegistrationStatusText,
  getPaymentStatusText,
} from '../../../../lib/formatting-helpers'
import { AdminCancelRegistrationModal } from './AdminCancelRegistrationModal'
import { PaymentLinkModal } from './PaymentLinkModal'
import { useAdminCancelRegistration, useGeneratePaymentLink } from '../../hooks/adminHooks'
import type { AdminCancelPayload } from '../../api/adminApi'

interface PlayerDetailsModalProps {
  player: AggregatedPlayerRow | null
  allRegistrations: RegistrationData[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailsModal({ player, open, onOpenChange }: PlayerDetailsModalProps) {
  const [cancelTarget, setCancelTarget] = useState<{
    registrationId: number
    tableName: string
    status: 'paid' | 'waitlist'
  } | null>(null)
  const [paymentLinkOpen, setPaymentLinkOpen] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const { mutate: cancelRegistration, isPending: isCancelling } = useAdminCancelRegistration()
  const { mutate: generateLink, isPending: isGeneratingLink } = useGeneratePaymentLink()

  function handleGeneratePaymentLink(registrationId: number, email: string) {
    setCheckoutUrl(null)
    setGenerateError(null)
    setPaymentLinkOpen(true)
    generateLink(
      { registrationId, email },
      {
        onSuccess: (data) => setCheckoutUrl(data.checkoutUrl),
        onError: (err) => setGenerateError(err.message),
      }
    )
  }

  if (!player) return null

  // Utiliser les groupes d'inscriptions pré-calculés
  const groups = player.registrationGroups

  // Calculer le total payé à partir des groupes
  const totalPaid = groups.reduce((sum, g) => sum + (g.payment?.amount ?? 0), 0)

  function handleCancelConfirm(payload: AdminCancelPayload) {
    if (!cancelTarget) return
    cancelRegistration(
      { registrationId: cancelTarget.registrationId, payload },
      {
        onSuccess: () => {
          toast.success('Inscription annulée')
          setCancelTarget(null)
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(`Erreur : ${err.message}`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto neo-brutal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-primary" />
            Détails du joueur
          </DialogTitle>
          <DialogDescription>Informations complètes, historique des inscriptions et paiements.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Section Joueur et Résumé Financier en grille */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Carte Joueur */}
            <Card className="neo-brutal-sm border-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base uppercase text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Identité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xl font-bold truncate">
                    {player.firstName} {player.lastName.toUpperCase()}
                  </p>
                  {player.bibNumber && (
                    <Badge variant="neutral" className="mt-1">
                      Dossard #{player.bibNumber}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Licence</span>
                    <span className="font-mono font-bold">{player.licence}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Points</span>
                    <span className="font-bold">{player.points}</span>
                  </div>
                  <div className="flex flex-col col-span-2 mt-2">
                    <span className="text-muted-foreground text-xs">Club</span>
                    <span className="truncate font-medium">{player.club}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-muted-foreground text-xs">Catégorie</span>
                    <span>{player.category || '-'}</span>
                  </div>
                  <div className="flex flex-col mt-2">
                    <span className="text-muted-foreground text-xs">Sexe</span>
                    <span>{player.sex === 'M' ? 'Homme' : player.sex === 'F' ? 'Femme' : '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carte Résumé Financier (si paiements) */}
            {totalPaid > 0 ? (
              <Card className="neo-brutal-sm border-2 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base uppercase text-muted-foreground flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Finances
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center h-[calc(100%-3rem)]">
                  <span className="text-muted-foreground text-sm mb-1">Total payé</span>
                  <span className="text-4xl font-bold text-green-700 tracking-tight">{formatCurrency(totalPaid)}</span>
                </CardContent>
              </Card>
            ) : (
              <Card className="neo-brutal-sm border-2 flex items-center justify-center p-6 bg-muted/20">
                <p className="text-muted-foreground text-sm italic">Aucun paiement enregistré</p>
              </Card>
            )}
          </div>

          {/* Section Inscriptions (groupées) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <LayoutList className="h-5 w-5" />
                Inscriptions
                <Badge variant="neutral" className="ml-2 rounded-full px-2">
                  {groups.length}
                </Badge>
              </h3>
            </div>

            <div className="space-y-4">
              {groups.map((group, index) => (
                <RegistrationGroupCard
                  key={group.groupId}
                  group={group}
                  index={index + 1}
                  onCancelTable={(registrationId, tableName, status) => setCancelTarget({ registrationId, tableName, status })}
                  onGeneratePaymentLink={handleGeneratePaymentLink}
                />
              ))}
            </div>
          </section>
        </div>
      </DialogContent>

      <PaymentLinkModal
        open={paymentLinkOpen}
        onOpenChange={(open) => {
          setPaymentLinkOpen(open)
          if (!open) setCheckoutUrl(null)
        }}
        checkoutUrl={checkoutUrl}
        isLoading={isGeneratingLink}
        error={generateError}
      />

      {cancelTarget && (
        <AdminCancelRegistrationModal
          open={cancelTarget !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setCancelTarget(null)
          }}
          tableName={cancelTarget.tableName}
          registrationId={cancelTarget.registrationId}
          status={cancelTarget.status}
          onConfirm={handleCancelConfirm}
          isPending={isCancelling}
        />
      )}
    </Dialog>
  )
}

interface RegistrationGroupCardProps {
  group: RegistrationGroup
  index: number
  onCancelTable: (registrationId: number, tableName: string, status: 'paid' | 'waitlist') => void
  onGeneratePaymentLink?: (registrationId: number, email: string) => void
}

function RegistrationGroupCard({ group, index, onCancelTable, onGeneratePaymentLink }: RegistrationGroupCardProps) {
  const paymentStatusInfo = group.payment ? getPaymentStatusText(group.payment.status) : null

  return (
    <Card className="neo-brutal-sm border-2 border-l-4 border-l-primary">
      <CardHeader className="pb-3 border-b-2 border-foreground/10 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {index}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-primary uppercase tracking-wide">INSCRIPTION</span>
              {group.isAdminCreated && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Créée par un admin</span>
                </div>
              )}
            </div>
          </div>
          {group.payment && paymentStatusInfo && (
            <div className="text-right flex flex-col items-end gap-1">
              <Badge variant={(STATUS_BADGE_VARIANTS[group.payment.status] as BadgeVariant) ?? 'neutral'}>
                {paymentStatusInfo.label}
              </Badge>
              <div className="text-lg font-bold">{formatCurrency(group.payment.amount)}</div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Tableaux du groupe */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tableaux</p>
          <div className="space-y-2">
            {group.tables
              .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date)
                if (dateCompare !== 0) return dateCompare
                return a.startTime.localeCompare(b.startTime)
              })
              .map((table) => {
                const statusInfo = getRegistrationStatusText(table.status)
                const isActive = ['paid', 'waitlist'].includes(table.status)
                const adminCancelled = table.adminCancellation

                return (
                  <div
                    key={table.id}
                    className="flex items-start justify-between gap-3 p-2 border-2 border-foreground/5 bg-background hover:border-foreground/20 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-sm">{table.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateShort(table.date)} • {table.startTime}
                      </span>
                      {adminCancelled && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {adminCancelled.refundStatus === 'none' && 'Sans remboursement'}
                          {adminCancelled.refundStatus === 'requested' && 'Remboursement à traiter'}
                          {adminCancelled.refundStatus === 'done' &&
                            `Remboursé${adminCancelled.refundedAt ? ` le ${formatDateTimeLong(adminCancelled.refundedAt)}` : ''}${adminCancelled.refundMethod ? ` par ${REFUND_METHOD_LABELS[adminCancelled.refundMethod] ?? adminCancelled.refundMethod}` : ''}`}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Badge variant={(STATUS_BADGE_VARIANTS[table.status] as BadgeVariant) ?? 'neutral'}>
                          {statusInfo.label}
                        </Badge>
                        {adminCancelled && (
                          <Badge variant="neutral" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      {isActive && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onCancelTable(table.registrationId, table.name, table.status as 'paid' | 'waitlist')}
                          className="h-6 px-2 text-xs"
                          title="Annuler ce tableau"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Annuler
                        </Button>
                      )}
                      {table.status === 'pending_payment' && onGeneratePaymentLink && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onGeneratePaymentLink(table.registrationId, group.subscriber.email)}
                          className="h-6 px-2 text-xs"
                          title="Générer un lien de paiement HelloAsso"
                        >
                          <Link2 className="w-3 h-3 mr-1" />
                          Lien
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-foreground/20">
          {/* Inscripteur / Admin créateur */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {group.isAdminCreated ? 'Créé par (admin)' : 'Contact inscription'}
            </p>
            <div className="text-sm bg-muted/10 p-2 rounded-sm border border-foreground/5">
              {group.isAdminCreated ? (
                // Affichage admin créateur
                group.createdByAdmin ? (
                  <>
                    <p className="font-bold">{group.createdByAdmin.fullName}</p>
                    <p>
                      <a
                        href={`mailto:${group.createdByAdmin.email}`}
                        className="text-primary hover:underline break-all"
                      >
                        {group.createdByAdmin.email}
                      </a>
                    </p>
                  </>
                ) : (
                  <p className="italic text-muted-foreground">Admin (non tracé)</p>
                )
              ) : (
                // Affichage subscriber normal
                <>
                  {(group.subscriber.firstName || group.subscriber.lastName) && (
                    <p className="font-bold">
                      {group.subscriber.firstName} {group.subscriber.lastName}
                    </p>
                  )}
                  <p>
                    <a href={`mailto:${group.subscriber.email}`} className="text-primary hover:underline break-all">
                      {group.subscriber.email}
                    </a>
                  </p>
                  {group.subscriber.phone && (
                    <p className="flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <a href={`tel:${group.subscriber.phone}`} className="text-primary hover:underline">
                        {group.subscriber.phone}
                      </a>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Détails Paiement */}
          {group.payment && (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Infos paiement
              </p>
              <div className="text-sm bg-muted/10 p-2 rounded-sm border border-foreground/5">
                <p className="text-xs text-muted-foreground mb-1">{formatDateTimeLong(group.payment.createdAt)}</p>
                {group.payment.helloassoOrderId && (
                  <p className="text-xs font-mono bg-background px-1 py-0.5 inline-block border border-foreground/10 mb-1">
                    Réf: {group.payment.helloassoOrderId}
                  </p>
                )}
                {group.payment.payer && (
                  <div className="mt-1 pt-1 border-t border-foreground/5">
                    <span className="text-xs text-muted-foreground">Payé par : </span>
                    <span className="font-medium">
                      {group.payment.payer.firstName} {group.payment.payer.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
