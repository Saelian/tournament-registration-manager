/* eslint-disable react-refresh/only-export-components */
import { Toaster as Sonner, toast } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-foreground group-[.toaster]:shadow-shadow group-[.toaster]:rounded-none',
                    description: 'group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-2 group-[.toast]:border-foreground group-[.toast]:font-bold',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:border-2 group-[.toast]:border-foreground group-[.toast]:font-bold',
                    error: 'group-[.toaster]:bg-destructive group-[.toaster]:text-white group-[.toaster]:border-foreground',
                    success:
                        'group-[.toaster]:bg-green-100 group-[.toaster]:text-green-900 group-[.toaster]:border-foreground',
                },
            }}
            {...props}
        />
    )
}

export { Toaster, toast }
