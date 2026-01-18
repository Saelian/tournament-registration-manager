import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCheckinDays, fetchCheckinPlayers, checkinPlayer, markPlayerAbsent, cancelCheckin } from '../api'

export function useCheckinDays() {
  return useQuery({
    queryKey: ['admin', 'checkin', 'days'],
    queryFn: fetchCheckinDays,
  })
}

export function useCheckinPlayers(date: string | null) {
  return useQuery({
    queryKey: ['admin', 'checkin', 'players', date],
    queryFn: () => fetchCheckinPlayers(date!),
    enabled: !!date,
  })
}

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: checkinPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'checkin', 'players'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}

export function useMarkAbsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markPlayerAbsent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'checkin', 'players'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}

export function useCancelCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelCheckin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'checkin', 'players'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] })
    },
  })
}
