import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Player } from './types'

type RegisteringFor = 'self' | 'other'

interface RegistrationFlowState {
  tournamentId: number | null
  registeringFor: RegisteringFor | null
  player: Player | null
}

interface RegistrationFlowContextValue extends RegistrationFlowState {
  setTournamentId: (id: number) => void
  setRegisteringFor: (type: RegisteringFor) => void
  setPlayer: (player: Player) => void
  reset: () => void
  isComplete: boolean
}

const initialState: RegistrationFlowState = {
  tournamentId: null,
  registeringFor: null,
  player: null,
}

const RegistrationFlowContext = createContext<RegistrationFlowContextValue | null>(null)

export function RegistrationFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RegistrationFlowState>(initialState)

  const setTournamentId = useCallback((id: number) => {
    setState((prev) => ({ ...prev, tournamentId: id }))
  }, [])

  const setRegisteringFor = useCallback((type: RegisteringFor) => {
    setState((prev) => ({ ...prev, registeringFor: type }))
  }, [])

  const setPlayer = useCallback((player: Player) => {
    setState((prev) => ({ ...prev, player }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const isComplete =
    state.tournamentId !== null && state.registeringFor !== null && state.player !== null

  return (
    <RegistrationFlowContext.Provider
      value={{
        ...state,
        setTournamentId,
        setRegisteringFor,
        setPlayer,
        reset,
        isComplete,
      }}
    >
      {children}
    </RegistrationFlowContext.Provider>
  )
}

export function useRegistrationFlow() {
  const context = useContext(RegistrationFlowContext)
  if (!context) {
    throw new Error('useRegistrationFlow must be used within a RegistrationFlowProvider')
  }
  return context
}
