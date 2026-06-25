export type Currency = string

export type User = {
  id: number
  name: string
  email: string
  currency: Currency
  firstDayOfWeek?: string | number
  firstDayOfMonth?: number
  viewMode?: string
  activeAccountTypeId?: number | null
  interval?: { from: string; to: string } | null
}

/** Shape returned by POST /auth/login and /auth/google (data field). */
export type LoginData = {
  id: number
  email: string
  currency: Currency
  accessToken: string
  refreshToken: string
}

export type Session = {
  accessToken: string
  refreshToken: string
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { name: string; email: string; password: string; currency: string }
export type GoogleNativePayload = { idToken: string }

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type UpdateUserPayload = Partial<{
  name: string
  email: string
  password: string
  currency: string
  firstDayOfWeek: number
  firstDayOfMonth: number
  viewMode: string
  activeAccountTypeId: number
}>
