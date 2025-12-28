import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog'
import { useRequestOtp, useVerifyOtp } from './userHooks'
import { requestOtpSchema, type RequestOtpFormData } from './types'
import { isApiError } from '../../lib/api'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('email')
      setEmail('')
      setOtpCode('')
      setOtpError(null)
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

  const onEmailSubmit = async (data: RequestOtpFormData) => {
    try {
      await requestOtpMutation.mutateAsync(data)
      setEmail(data.email)
      setStep('otp')
      setResendTimer(60)
      setOtpCode('')
      setOtpError(null)
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

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError(null)

    if (otpCode.length !== 6) {
      setOtpError('Le code doit contenir 6 chiffres')
      return
    }

    try {
      await verifyOtpMutation.mutateAsync({ email, code: otpCode })
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setOtpError('Code invalide ou expiré')
      } else {
        console.error(error)
      }
    }
  }

  const handleChangeEmail = () => {
    setStep('email')
    setOtpCode('')
    setOtpError(null)
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
          <form className="space-y-4 mt-4" onSubmit={onOtpSubmit}>
            <div className="flex flex-col items-center">
              <Label htmlFor="login-code" className="mb-3">Code de connexion (6 chiffres)</Label>
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => {
                  setOtpCode(value)
                  setOtpError(null)
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {otpError && (
                <p className="mt-2 text-sm text-destructive">{otpError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verifyOtpMutation.isPending || otpCode.length !== 6}
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
