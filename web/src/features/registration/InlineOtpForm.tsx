import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useRequestOtp, useVerifyOtp } from '../auth/userHooks'
import { requestOtpSchema, verifyOtpSchema, type RequestOtpFormData } from '../auth/types'
import { isApiError } from '../../lib/api'

interface InlineOtpFormProps {
  onSuccess: () => void
}

export function InlineOtpForm({ onSuccess }: InlineOtpFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const requestOtpMutation = useRequestOtp()
  const verifyOtpMutation = useVerifyOtp()

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
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
  })

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    setError: setOtpError,
  } = useForm<{ code: string }>({
    resolver: zodResolver(verifyOtpSchema.pick({ code: true })),
  })

  const onEmailSubmit = async (data: RequestOtpFormData) => {
    try {
      await requestOtpMutation.mutateAsync(data)
      setEmail(data.email)
      setStep('otp')
      setResendTimer(60)
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
      onSuccess()
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setOtpError('code', { message: 'Code invalide ou expire' })
      } else {
        console.error(error)
      }
    }
  }

  if (step === 'email') {
    return (
      <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-3">
        <div>
          <Label htmlFor="inline-email">Email</Label>
          <Input
            id="inline-email"
            type="email"
            autoComplete="email"
            placeholder="votre@email.com"
            {...registerEmail('email')}
            className="mt-1"
          />
          {emailErrors.email && (
            <p className="mt-1 text-sm text-destructive">{emailErrors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
          {requestOtpMutation.isPending ? 'Envoi...' : 'Recevoir le code'}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmitOtp(onOtpSubmit)} className="space-y-3">
      <p className="text-sm text-muted-foreground">Code envoye a {email}</p>
      <div>
        <Label htmlFor="inline-code">Code (6 chiffres)</Label>
        <Input
          id="inline-code"
          type="text"
          maxLength={6}
          className="mt-1 text-center text-xl tracking-widest"
          {...registerOtp('code')}
        />
        {otpErrors.code && (
          <p className="mt-1 text-sm text-destructive">{otpErrors.code.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
        {verifyOtpMutation.isPending ? 'Verification...' : 'Se connecter'}
      </Button>
      <div className="flex justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0 || requestOtpMutation.isPending}
          className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer'}
        </button>
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-muted-foreground hover:text-foreground"
        >
          Changer d'email
        </button>
      </div>
    </form>
  )
}
