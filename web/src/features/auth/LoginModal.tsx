import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'
import { useRequestOtp, useVerifyOtp } from './userHooks'
import { requestOtpSchema, verifyOtpSchema, type RequestOtpFormData } from './types'
import { isApiError } from '../../lib/api'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('email')
      setEmail('')
      setResendTimer(0)
    }
  }, [open])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [resendTimer])

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
    reset: resetEmailForm,
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
  })

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    setError: setOtpError,
    reset: resetOtpForm,
  } = useForm<{ code: string }>({
    resolver: zodResolver(verifyOtpSchema.pick({ code: true })),
  })

  const onEmailSubmit = async (data: RequestOtpFormData) => {
    try {
      await requestOtpMutation.mutateAsync(data)
      setEmail(data.email)
      setStep('otp')
      setResendTimer(60)
      resetOtpForm()
    } catch (error) {
      console.error(error)
    }
  }

  const handleResend = async () => {
    try {
      await requestOtpMutation.mutateAsync({ email })
      setResendTimer(60)
    } catch (error) {
      console.error(error)
    }
  }

  const onOtpSubmit = async (data: { code: string }) => {
    try {
      await verifyOtpMutation.mutateAsync({ email, code: data.code })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setOtpError('code', { message: 'Code invalide ou expiré' })
      } else {
        console.error(error)
      }
    }
  }

  const handleChangeEmail = () => {
    setStep('email')
    resetEmailForm({ email })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connexion</DialogTitle>
          <DialogDescription>
            {step === 'email'
              ? 'Entrez votre email pour recevoir un code de connexion'
              : `Un code a été envoyé à ${email}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'email' ? (
          <form className="space-y-4 mt-4" onSubmit={handleSubmitEmail(onEmailSubmit)}>
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                {...registerEmail('email')}
                className="mt-1"
              />
              {emailErrors.email && (
                <p className="mt-1 text-sm text-destructive">{emailErrors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending ? 'Envoi...' : 'Recevoir le code'}
            </Button>
          </form>
        ) : (
          <form className="space-y-4 mt-4" onSubmit={handleSubmitOtp(onOtpSubmit)}>
            <div>
              <Label htmlFor="login-code">Code de connexion (6 chiffres)</Label>
              <Input
                id="login-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="mt-1 text-center text-2xl tracking-widest"
                {...registerOtp('code')}
              />
              {otpErrors.code && (
                <p className="mt-1 text-sm text-destructive">{otpErrors.code.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? 'Vérification...' : 'Se connecter'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || requestOtpMutation.isPending}
                className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {resendTimer > 0 ? `Renvoyer le code (${resendTimer}s)` : 'Renvoyer le code'}
              </button>
              <div className="block">
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Changer d'email
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
