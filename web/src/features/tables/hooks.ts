import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { Table, TableFormData } from './types'

const TABLES_KEY = ['tables']

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
