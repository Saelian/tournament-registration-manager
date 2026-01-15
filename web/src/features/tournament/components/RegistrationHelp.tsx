import { InfoIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@lib/utils'

export type HelpStepVariant = 'pink' | 'yellow' | 'green' | 'blue' | 'purple' | 'default'

export interface HelpStep {
  icon: LucideIcon
  title: string
  description: string
  variant?: HelpStepVariant
}

interface RegistrationHelpProps {
  title?: string
  steps: HelpStep[]
  className?: string
}

const VARIANT_STYLES: Record<HelpStepVariant, { bg: string; icon: string }> = {
  pink: { bg: 'bg-pink-100', icon: 'text-pink-600' },
  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
  green: { bg: 'bg-green-100', icon: 'text-green-600' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  default: { bg: 'bg-gray-100', icon: 'text-gray-600' },
}

export function RegistrationHelp({
  title = "Comment s'inscrire ?",
  steps,
  className,
}: RegistrationHelpProps) {
  return (
    <div
      className={cn('animate-on-load animate-slide-in-left animation-delay-150 mb-6', className)}
    >
      <div className="bg-card neo-brutal p-4 md:p-6">
        <h2 className="text-xl font-black mb-6 flex items-center gap-3">
          <div className="bg-blue-300 p-2 neo-brutal-sm">
            <InfoIcon className="w-5 h-5" />
          </div>
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4">
          {steps.map((step, index) => {
            const variant = step.variant || 'default'
            const styles = VARIANT_STYLES[variant]
            const StepIcon = step.icon

            return (
              <div
                key={index}
                className={cn(
                  'p-4 border-2 border-foreground relative hover:-translate-y-1 transition-transform shadow-none hover:shadow-shadow neo-brutal',
                  styles.bg
                )}
              >
                <div className="absolute -top-3 -right-3 bg-primary text-background font-black w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <StepIcon className={cn('w-6 h-6', styles.icon)} />
                  <h4 className="font-bold text-lg leading-tight">{step.title}</h4>
                </div>
                <p className="text-sm text-foreground/80 font-medium leading-snug">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
