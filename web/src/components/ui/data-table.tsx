import { cn } from '@lib/utils'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  className?: string
  emptyMessage?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  className,
  emptyMessage = 'Aucune donnée',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-secondary border-2 border-dashed border-foreground p-8 text-center">
        <p className="font-bold text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse bg-card neo-brutal">
        <thead>
          <tr className="border-b-2 border-foreground bg-secondary">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('px-4 py-3 text-left font-bold', column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                'border-b border-foreground/20 transition-colors hover:bg-secondary/50',
                index === data.length - 1 && 'border-b-0'
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-4 py-3', column.className)}>
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key]?.toString()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
