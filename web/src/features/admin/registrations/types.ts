export interface PlayerInfo {
  id: number
  licence: string
  firstName: string
  lastName: string
  club: string
  points: number
  sex: string | null
  category: string | null
  bibNumber: number | null
}

export interface TableInfo {
  id: number
  name: string
  date: string
  startTime: string
}

export interface SubscriberInfo {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
}

export interface PaymentInfo {
  id: number
  amount: number
  status: string
  createdAt: string
  helloassoOrderId: string | null
}

export interface RegistrationData {
  id: number
  status: string
  waitlistRank: number | null
  isAdminCreated: boolean
  checkedInAt: string | null
  createdAt: string
  player: PlayerInfo
  table: TableInfo
  subscriber: SubscriberInfo
  payment: PaymentInfo | null
}

export interface AdminRegistrationsResponse {
  registrations: RegistrationData[]
  tournamentDays: string[]
}

export interface AggregatedPlayerRow {
  playerId: number
  bibNumber: number | null
  firstName: string
  lastName: string
  licence: string
  points: number
  club: string
  sex: string | null
  category: string | null
  tables: TableInfo[]
  registrationStatuses: Record<number, string>
  registrationWaitlistRanks: Record<number, number | null>
  registrationCheckedInAt: Record<number, string | null>
  hasAdminRegistration: boolean
  subscriber: SubscriberInfo
  payments: (PaymentInfo | null)[]
  registrationIds: number[]
  registrationIdByTableId: Record<number, number>
  createdAt: string
}
