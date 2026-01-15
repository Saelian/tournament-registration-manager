import { useQuery } from '@tanstack/react-query'
import { fetchPublicRegistrations } from '../api/publicApi'

export function usePublicRegistrations(tableId?: number) {
    return useQuery({
        queryKey: ['public', 'registrations', tableId ?? 'all'],
        queryFn: () => fetchPublicRegistrations(tableId ? { tableId } : undefined),
    })
}
