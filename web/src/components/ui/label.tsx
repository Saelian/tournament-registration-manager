import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn('text-sm font-bold leading-none', className)}
        {...props}
      />
    )
  }
)

Label.displayName = 'Label'
