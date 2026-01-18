import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card'
import { ProfileForm } from '../components/ProfileForm'
import { useCurrentUser, useUpdateProfile } from '../../auth'
import type { ProfileFormData } from '../../auth/types'

export function ProfilePage() {
  const navigate = useNavigate()
  const { data: user, isLoading } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success('Profil mis à jour avec succès')
      navigate('/dashboard')
    } catch {
      toast.error('Erreur lors de la mise à jour du profil')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-grain">
      <div className="bg-gradient-secondary-to-white min-h-screen">
        <div className="max-w-md mx-auto px-4 py-8 animate-on-load animate-slide-up">
          <Card>
            <CardHeader>
              <CardTitle>Mon profil</CardTitle>
              <CardDescription>Modifiez vos informations de contact</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} onSubmit={handleSubmit} isSubmitting={updateProfileMutation.isPending} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
