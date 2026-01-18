import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'
import { ProfileForm } from '@features/profile/components/ProfileForm'
import { useCurrentUser, useUpdateProfile } from '@features/auth'
import type { ProfileFormData } from '@features/auth/types'

export function ProfileTabContent() {
  const { data: user, isLoading } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Profil mis à jour avec succès')
      // Rester sur la page (pas de navigation)
    } catch {
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        <div className="animate-pulse text-lg font-bold">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Mes informations de contact</CardTitle>
          <CardDescription>Modifiez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} onSubmit={handleSubmit} isSubmitting={updateProfileMutation.isPending} />
        </CardContent>
      </Card>
    </div>
  )
}
