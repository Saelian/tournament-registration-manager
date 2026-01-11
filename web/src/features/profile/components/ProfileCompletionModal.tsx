import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@components/ui/dialog'
import { ProfileForm } from './ProfileForm'
import { useUpdateProfile } from '../../auth'
import type { ProfileFormData, User } from '../../auth/types'

interface ProfileCompletionModalProps {
  user: User | null
  open: boolean
}

export function ProfileCompletionModal({ user, open }: ProfileCompletionModalProps) {
  const updateProfileMutation = useUpdateProfile()

  const handleSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data)
  }

  return (
    <Dialog open={open}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Complétez votre profil</DialogTitle>
          <DialogDescription>
            Ces informations nous permettent de vous contacter en cas de besoin concernant vos
            inscriptions aux tournois.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <ProfileForm
            user={user}
            onSubmit={handleSubmit}
            isSubmitting={updateProfileMutation.isPending}
            submitLabel="Continuer"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
