import { BASE_URL } from '@/constants/api'
import { getAccessToken, getRefreshToken, persistSession } from '@/lib/session'

/** Backend envelope — every response is { msg, data, status }. Success is decided by HTTP status. */
export type ApiResponse<T> = {
  msg: string
  data: T
  status: number
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  /** internal — set when a request is being replayed after a token refresh */
  _retried?: boolean
}

// Called when the session can no longer be refreshed, so AuthProvider can react.
let onAuthExpired: (() => void) | null = null
export function setOnAuthExpired(cb: (() => void) | null) {
  onAuthExpired = cb
}

export function buildApiUrl(endpoint: string): string {
  if (!BASE_URL) throw new ApiError('EXPO_PUBLIC_BASE_URL is not configured', 0)
  const base = BASE_URL.replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

// Raw refresh call — does NOT go through apiClient to avoid recursion.
let refreshInFlight: Promise<boolean> | null = null
async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false
    try {
      const res = await fetch(buildApiUrl('/auth/refreshToken'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      const json = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>
      if (!res.ok || !json?.data?.accessToken) return false
      await persistSession({ accessToken: json.data.accessToken, refreshToken: json.data.refreshToken })
      return true
    } catch {
      return false
    }
  })()
  const result = await refreshInFlight
  refreshInFlight = null
  return result
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { body, headers, _retried, ...rest } = options
  const accessToken = getAccessToken()

  const response = await fetch(buildApiUrl(endpoint), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Attempt a single transparent refresh on auth failure.
  if (response.status === 401 && !_retried) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return apiClient<T>(endpoint, { ...options, _retried: true })
    }
    await persistSession(null)
    onAuthExpired?.()
  }

  let json: ApiResponse<T>
  try {
    json = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('Unexpected server response', response.status)
  }

  if (!response.ok) {
    throw new ApiError(json?.msg || 'Request failed', response.status)
  }
  return json
}

export function requireApiData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.data === undefined || response.data === null) {
    throw new ApiError(response.msg || fallbackMessage, response.status)
  }
  return response.data
}
