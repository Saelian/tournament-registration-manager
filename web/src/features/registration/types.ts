export interface Player {
  id?: number
  licence: string
  firstName: string
  lastName: string
  club: string
  points: number
  sex: string | null
  category: string | null
  needsVerification?: boolean
}

export interface PlayerSearchError {
  message: string
  allowManualEntry?: boolean
}
