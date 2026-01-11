import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { profileSchema, type ProfileFormData, type User } from '../../auth/types'

interface ProfileFormProps {
  user?: User | null
  onSubmit: (data: ProfileFormData) => Promise<void>
  isSubmitting: boolean
  submitLabel?: string
}

export function ProfileForm({
  user,
  onSubmit,
  isSubmitting,
  submitLabel = 'Enregistrer',
}: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    await onSubmit(data)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          {...register('firstName')}
          className="mt-1"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="lastName">Nom</Label>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          {...register('lastName')}
          className="mt-1"
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="0612345678"
          {...register('phone')}
          className="mt-1"
        />
        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enregistrement...' : submitLabel}
      </Button>
    </form>
  )
}
