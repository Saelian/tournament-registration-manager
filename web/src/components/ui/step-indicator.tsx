import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@lib/utils'

interface StepIndicatorProps extends HTMLAttributes<HTMLDivElement> {
    stepNumber: number
    title: string
    description?: string
    icon?: ReactNode
    variant?: 'default' | 'completed' | 'active'
}

const StepIndicator = forwardRef<HTMLDivElement, StepIndicatorProps>(
    ({ className, stepNumber, title, description, icon, variant = 'default', ...props }, ref) => {
        const variantClasses = {
            default: 'bg-card',
            completed: 'bg-secondary',
            active: 'bg-primary text-primary-foreground',
        }

        const numberClasses = {
            default: 'bg-secondary text-foreground',
            completed: 'bg-primary text-primary-foreground',
            active: 'bg-card text-foreground',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    'p-6 neo-brutal flex flex-col items-center text-center',
                    variantClasses[variant],
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        'w-12 h-12 flex items-center justify-center font-black text-xl mb-4 border-2 border-foreground',
                        numberClasses[variant]
                    )}
                >
                    {icon || stepNumber}
                </div>
                <h3
                    className={cn(
                        'font-bold text-lg mb-2',
                        variant === 'active' ? 'text-primary-foreground' : 'text-foreground'
                    )}
                >
                    {title}
                </h3>
                {description && (
                    <p
                        className={cn(
                            'text-sm',
                            variant === 'active' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
        )
    }
)
StepIndicator.displayName = 'StepIndicator'

interface StepsContainerProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

const StepsContainer = forwardRef<HTMLDivElement, StepsContainerProps>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('grid gap-4 md:grid-cols-3', className)} {...props}>
        {children}
    </div>
))
StepsContainer.displayName = 'StepsContainer'

export { StepIndicator, StepsContainer }
export type { StepIndicatorProps, StepsContainerProps }
