import { forwardRef, type HTMLAttributes, useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@lib/utils'
import type { FilterConfig, FilterValue } from '../../hooks/use-table-filters'

interface FilterDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  config: FilterConfig
  value?: FilterValue
  onChange: (value: FilterValue) => void
  onClear: () => void
}

const FilterDropdown = forwardRef<HTMLDivElement, FilterDropdownProps>(
  ({ className, config, value, onChange, onClear, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const hasValue =
      value &&
      (value.select !== undefined ||
        value.boolean !== undefined ||
        (value.range && (value.range.min !== undefined || value.range.max !== undefined)))

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getDisplayValue = () => {
      if (!value) return config.label

      if (config.type === 'select' && value.select) {
        const option = config.options?.find((o) => o.value === value.select)
        return option?.label || value.select
      }

      if (config.type === 'range' && value.range) {
        const { min, max } = value.range
        if (min !== undefined && max !== undefined) return `${min} - ${max}`
        if (min !== undefined) return `≥ ${min}`
        if (max !== undefined) return `≤ ${max}`
      }

      if (config.type === 'boolean' && value.boolean !== undefined) {
        return value.boolean ? 'Oui' : 'Non'
      }

      return config.label
    }

    return (
      <div ref={dropdownRef} className={cn('relative', className)} {...props}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 h-10 px-3 bg-card neo-brutal-sm',
            'hover:bg-secondary/50 transition-colors',
            hasValue && 'bg-secondary'
          )}
        >
          <span className={cn('text-sm', hasValue ? 'font-bold' : 'text-muted-foreground')}>{getDisplayValue()}</span>
          {hasValue ? (
            <X
              className="w-4 h-4"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            />
          ) : (
            <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
          )}
        </button>

        {isOpen && (
          <div ref={ref} className="absolute top-full left-0 mt-1 z-50 min-w-[200px] bg-card neo-brutal">
            {config.type === 'select' && config.options && (
              <div className="py-1">
                {config.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange({ select: option.value })
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-secondary/50',
                      value?.select === option.value && 'bg-secondary font-bold'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {config.type === 'range' && (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Min</label>
                  <input
                    type="number"
                    value={value?.range?.min ?? ''}
                    onChange={(e) =>
                      onChange({
                        range: {
                          ...value?.range,
                          min: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    min={config.min}
                    max={config.max}
                    className="w-full h-8 px-2 bg-background border-2 border-foreground text-sm"
                    placeholder="Min"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max</label>
                  <input
                    type="number"
                    value={value?.range?.max ?? ''}
                    onChange={(e) =>
                      onChange({
                        range: {
                          ...value?.range,
                          max: e.target.value ? Number(e.target.value) : undefined,
                        },
                      })
                    }
                    min={config.min}
                    max={config.max}
                    className="w-full h-8 px-2 bg-background border-2 border-foreground text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            )}

            {config.type === 'boolean' && (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange({ boolean: true })
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-secondary/50',
                    value?.boolean === true && 'bg-secondary font-bold'
                  )}
                >
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({ boolean: false })
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-secondary/50',
                    value?.boolean === false && 'bg-secondary font-bold'
                  )}
                >
                  Non
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)
FilterDropdown.displayName = 'FilterDropdown'

export { FilterDropdown }
