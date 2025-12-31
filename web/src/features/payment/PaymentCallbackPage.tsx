import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'
import { buttonVariants } from '../../components/ui/button'
import { cn } from '../../lib/utils'

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-800 mb-2">Paiement réussi !</h1>
          <p className="text-green-700 mb-6">
            Votre inscription a été confirmée. Vous recevrez un email de confirmation.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className={cn(buttonVariants())}>
              Voir mes inscriptions
            </Link>
            <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
        <div className="mt-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock className="w-5 h-5" />
            <span className="text-sm">
              La confirmation peut prendre quelques instants à apparaître dans votre tableau de
              bord.
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Paiement échoué</h1>
          <p className="text-red-700 mb-6">
            Le paiement n'a pas pu être effectué. Vos inscriptions sont toujours en attente.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className={cn(buttonVariants())}>
              Réessayer depuis le tableau de bord
            </Link>
            <Link to="/" className={cn(buttonVariants({ variant: 'outline' }))}>
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-8">
        <Loader2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Traitement en cours...</h1>
        <p className="text-gray-600 mb-6">
          Veuillez patienter pendant la vérification de votre paiement.
        </p>
      </div>
    </div>
  )
}
