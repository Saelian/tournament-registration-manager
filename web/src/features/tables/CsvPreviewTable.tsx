import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, Trophy, Euro, Gift } from 'lucide-react'
import { cn } from '@lib/utils'
import type { CsvParsedRow } from './types'

interface CsvPreviewTableProps {
  rows: CsvParsedRow[]
}

export function CsvPreviewTable({ rows }: CsvPreviewTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const toggleRow = (rowNumber: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) {
        next.delete(rowNumber)
      } else {
        next.add(rowNumber)
      }
      return next
    })
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div className="border-2 border-foreground rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted sticky top-0">
          <tr>
            <th className="text-left p-3 font-bold w-10">#</th>
            <th className="text-left p-3 font-bold w-10">Statut</th>
            <th className="text-left p-3 font-bold">Tableau</th>
            <th className="text-left p-3 font-bold">Date</th>
            <th className="text-left p-3 font-bold">Heure</th>
            <th className="text-left p-3 font-bold">Points</th>
            <th className="text-right p-3 font-bold">Prix</th>
            <th className="text-right p-3 font-bold">Quota</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <>
              <tr
                key={row.rowNumber}
                className={cn(
                  'border-t border-muted cursor-pointer hover:bg-muted/50 transition-colors',
                  !row.isValid && 'bg-destructive/10'
                )}
                onClick={() => toggleRow(row.rowNumber)}
              >
                <td className="p-3 text-muted-foreground">{row.rowNumber}</td>
                <td className="p-3">
                  {row.isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </td>
                <td className="p-3 font-medium">
                  {row.isValid ? row.data?.name : <span className="text-destructive">Erreur</span>}
                </td>
                <td className="p-3">{row.isValid && row.data ? formatDate(row.data.date) : '-'}</td>
                <td className="p-3">{row.isValid && row.data ? row.data.startTime : '-'}</td>
                <td className="p-3">
                  {row.isValid && row.data ? `${row.data.pointsMin} - ${row.data.pointsMax}` : '-'}
                </td>
                <td className="p-3 text-right">
                  {row.isValid && row.data ? `${row.data.price} €` : '-'}
                </td>
                <td className="p-3 text-right">{row.isValid && row.data ? row.data.quota : '-'}</td>
                <td className="p-3">
                  {expandedRows.has(row.rowNumber) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </td>
              </tr>

              {expandedRows.has(row.rowNumber) && (
                <tr key={`${row.rowNumber}-details`} className="border-t border-muted">
                  <td colSpan={9} className="p-4 bg-muted/30">
                    {row.isValid && row.data ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-4 text-sm">
                          {row.data.isSpecial && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                              Tableau spécial
                            </span>
                          )}
                          {row.data.genderRestriction && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium">
                              {row.data.genderRestriction === 'F' ? 'Féminin' : 'Masculin'}
                            </span>
                          )}
                          {row.data.allowedCategories && row.data.allowedCategories.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                              {row.data.allowedCategories.join(', ')}
                            </span>
                          )}
                          {row.data.maxCheckinTime && (
                            <span className="text-muted-foreground">
                              Pointage avant : {row.data.maxCheckinTime}
                            </span>
                          )}
                        </div>

                        {row.data.prizes && row.data.prizes.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 font-medium mb-2">
                              <Trophy className="h-4 w-4" />
                              <span>Dotations ({row.data.prizes.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {row.data.prizes.map((prize) => (
                                <span
                                  key={prize.rank}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-card border border-muted rounded text-sm"
                                >
                                  <span className="font-medium">{prize.rank}e :</span>
                                  {prize.prizeType === 'cash' ? (
                                    <>
                                      <Euro className="h-3 w-3" />
                                      {prize.cashAmount} €
                                    </>
                                  ) : (
                                    <>
                                      <Gift className="h-3 w-3" />
                                      {prize.itemDescription || 'Lot'}
                                    </>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-medium text-destructive">Erreurs de validation :</p>
                        <ul className="list-disc list-inside text-sm text-destructive">
                          {row.errors.map((error, index) => (
                            <li key={index}>
                              <span className="font-medium">{error.field}</span> : {error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
