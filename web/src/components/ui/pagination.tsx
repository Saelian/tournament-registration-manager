import { forwardRef, type HTMLAttributes } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@lib/utils'

export interface PaginationConfig {
  pageSize: number
  showPageNumbers?: boolean
  showFirstLast?: boolean
}

interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPageNumbers?: boolean
}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      onPageChange,
      showFirstLast = true,
      showPageNumbers = true,
      ...props
    },
    ref
  ) => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    const getPageNumbers = () => {
      const pages: (number | 'ellipsis')[] = []
      const maxVisible = 5

      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }

      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      // Pages around current
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages)
      }

      return pages
    }

    const buttonClass = cn(
      'h-10 px-3 border-2 border-foreground bg-card',
      'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
      'hover:bg-secondary/50 transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card'
    )

    const activeButtonClass = cn(
      buttonClass,
      'bg-primary text-primary-foreground hover:bg-primary/90'
    )

    return (
      <div
        ref={ref}
        className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}
        {...props}
      >
        <div className="text-sm text-muted-foreground">
          {startItem}-{endItem} sur {totalItems} résultats
        </div>

        <div className="flex items-center gap-1">
          {showFirstLast && (
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={buttonClass}
              aria-label="Première page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={buttonClass}
            aria-label="Page précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {showPageNumbers &&
            getPageNumbers().map((page, index) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={currentPage === page ? activeButtonClass : buttonClass}
                >
                  {page}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={buttonClass}
            aria-label="Page suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {showFirstLast && (
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={buttonClass}
              aria-label="Dernière page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Pagination.displayName = 'Pagination'

export { Pagination }
