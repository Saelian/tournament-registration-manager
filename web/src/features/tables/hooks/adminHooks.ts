import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@lib/api'
import type {
  Table,
  TableFormData,
  TablePrize,
  TableSponsor,
  CsvPreviewResponse,
  CsvConfirmResponse,
  CsvParsedTableData,
} from '../types'

const TABLES_KEY = ['tables']

interface PrizeFormData {
  rank: number
  prizeType: 'cash' | 'item'
  cashAmount?: number | null
  itemDescription?: string | null
}

export function useTables() {
  return useQuery({
    queryKey: TABLES_KEY,
    queryFn: async () => {
      const { data } = await api.get<Table[]>('/admin/tables')
      return data
    },
  })
}

export function useTable(id: number | null) {
  return useQuery({
    queryKey: [...TABLES_KEY, id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get<Table>(`/admin/tables/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TableFormData) => {
      const { data: result } = await api.post<Table>('/admin/tables', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_KEY })
    },
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TableFormData }) => {
      const { data: result } = await api.put<Table>(`/admin/tables/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_KEY })
    },
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/tables/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_KEY })
    },
  })
}

// Prize hooks
export function useTablePrizes(tableId: number | null) {
  return useQuery({
    queryKey: [...TABLES_KEY, tableId, 'prizes'],
    queryFn: async () => {
      if (!tableId) return { prizes: [], totalCashPrize: 0 }
      const { data } = await api.get<{ prizes: TablePrize[]; totalCashPrize: number }>(
        `/admin/tables/${tableId}/prizes`
      )
      return data
    },
    enabled: !!tableId,
  })
}

export function useCreatePrize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tableId, data }: { tableId: number; data: PrizeFormData }) => {
      const { data: result } = await api.post<TablePrize>(`/admin/tables/${tableId}/prizes`, data)
      return { tableId, prize: result }
    },
    onSuccess: ({ tableId, prize }) => {
      // Update the prizes query by adding the new prize
      queryClient.setQueryData(
        [...TABLES_KEY, tableId, 'prizes'],
        (old: { prizes: TablePrize[]; totalCashPrize: number } | undefined) => {
          if (!old) return { prizes: [prize], totalCashPrize: prize.cashAmount ?? 0 }
          const newPrizes = [...old.prizes, prize]
          const totalCashPrize = newPrizes
            .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
            .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)
          return { prizes: newPrizes, totalCashPrize }
        }
      )
      queryClient.invalidateQueries({ queryKey: TABLES_KEY, exact: true })
    },
  })
}

export function useUpdatePrize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tableId, prizeId, data }: { tableId: number; prizeId: number; data: PrizeFormData }) => {
      const { data: result } = await api.put<TablePrize>(`/admin/tables/${tableId}/prizes/${prizeId}`, data)
      return { tableId, prize: result }
    },
    onSuccess: ({ tableId, prize }) => {
      // Update the prizes query by replacing the updated prize
      queryClient.setQueryData(
        [...TABLES_KEY, tableId, 'prizes'],
        (old: { prizes: TablePrize[]; totalCashPrize: number } | undefined) => {
          if (!old) return { prizes: [prize], totalCashPrize: prize.cashAmount ?? 0 }
          const newPrizes = old.prizes.map((p) => (p.id === prize.id ? prize : p))
          const totalCashPrize = newPrizes
            .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
            .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)
          return { prizes: newPrizes, totalCashPrize }
        }
      )
      queryClient.invalidateQueries({ queryKey: TABLES_KEY, exact: true })
    },
  })
}

export function useDeletePrize() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tableId, prizeId }: { tableId: number; prizeId: number }) => {
      await api.delete(`/admin/tables/${tableId}/prizes/${prizeId}`)
      return { tableId, prizeId }
    },
    onSuccess: ({ tableId, prizeId }) => {
      // Update the prizes query by removing the deleted prize
      queryClient.setQueryData(
        [...TABLES_KEY, tableId, 'prizes'],
        (old: { prizes: TablePrize[]; totalCashPrize: number } | undefined) => {
          if (!old) return { prizes: [], totalCashPrize: 0 }
          const newPrizes = old.prizes.filter((p) => p.id !== prizeId)
          const totalCashPrize = newPrizes
            .filter((p) => p.prizeType === 'cash' && p.cashAmount !== null)
            .reduce((sum, p) => sum + (p.cashAmount ?? 0), 0)
          return { prizes: newPrizes, totalCashPrize }
        }
      )
      queryClient.invalidateQueries({ queryKey: TABLES_KEY, exact: true })
    },
  })
}

// Table Sponsor hooks
export function useTableSponsors(tableId: number | null) {
  return useQuery({
    queryKey: [...TABLES_KEY, tableId, 'sponsors'],
    queryFn: async () => {
      if (!tableId) return []
      const { data } = await api.get<TableSponsor[]>(`/admin/tables/${tableId}/sponsors`)
      return data
    },
    enabled: !!tableId,
  })
}

export function useSyncTableSponsors() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tableId, sponsorIds }: { tableId: number; sponsorIds: number[] }) => {
      const { data } = await api.put<TableSponsor[]>(`/admin/tables/${tableId}/sponsors`, {
        sponsorIds,
      })
      return { tableId, sponsors: data }
    },
    onSuccess: ({ tableId, sponsors }) => {
      // Update the specific sponsors query immediately
      queryClient.setQueryData([...TABLES_KEY, tableId, 'sponsors'], sponsors)
      // Also invalidate the tables list to refresh the summary
      queryClient.invalidateQueries({ queryKey: TABLES_KEY, exact: true })
      // Invalidate sponsors list since table associations changed
      queryClient.invalidateQueries({ queryKey: ['sponsors'] })
    },
  })
}

// CSV Import hooks
export function usePreviewCsvImport() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<CsvPreviewResponse>('/admin/tables/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data
    },
  })
}

export function useConfirmCsvImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (rows: CsvParsedTableData[]) => {
      const { data } = await api.post<CsvConfirmResponse>('/admin/tables/import/confirm', { rows })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_KEY })
    },
  })
}
