import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/ui/input-otp'
import { useRequestOtp, useVerifyOtp } from '../hooks'
import { requestOtpSchema, type RequestOtpFormData } from '../types'
import { isApiError } from '../../../lib/api'

export function UserLoginPage() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/dashboard' // Default to dashboard

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

  const onEmailSubmit = async (data: RequestOtpFormData) => {
    try {
      await requestOtpMutation.mutateAsync(data)
      setEmail(data.email)
      setStep('otp')
      setResendTimer(60)
    } catch (error) {
      // Handle error
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
      navigate(returnUrl)
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setOtpError('Code invalide ou expiré')
      } else {
        console.error(error)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Connexion</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email'
              ? 'Entrez votre email pour recevoir un code de connexion'
              : `Un code a été envoyé à ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitEmail(onEmailSubmit)}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...registerEmail('email')} className="mt-1" />
              {emailErrors.email && <p className="mt-1 text-sm text-red-600">{emailErrors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
              {requestOtpMutation.isPending ? 'Envoi...' : 'Recevoir le code'}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={onOtpSubmit}>
            <div className="flex flex-col items-center">
              <Label htmlFor="code" className="mb-3">
                Code de connexion (6 chiffres)
              </Label>
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
              {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending || otpCode.length !== 6}>
              {verifyOtpMutation.isPending ? 'Vérification...' : 'Se connecter'}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || requestOtpMutation.isPending}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Renvoyer le code (${resendTimer}s)` : 'Renvoyer le code'}
              </button>
              <div className="block">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtpCode('')
                    setOtpError(null)
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Changer d'email
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
