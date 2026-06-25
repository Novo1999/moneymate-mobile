import { AUTH_SESSION_STORAGE_KEY } from '@/constants/auth'
import type { Session } from '@/types/auth'
import * as SecureStore from 'expo-secure-store'

// In-memory cache so the API client can read tokens synchronously,
// mirroring the web app's localStorage-backed token access.
let currentSession: Session | null = null

export function getAccessToken(): string | null {
  return currentSession?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  return currentSession?.refreshToken ?? null
}

export function getSession(): Session | null {
  return currentSession
}

export async function persistSession(session: Session | null): Promise<void> {
  currentSession = session
  try {
    if (session) {
      await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
    } else {
      await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY)
    }
  } catch {
    // Persistence is best-effort; the in-memory session still works for this run.
  }
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY)
    currentSession = raw ? (JSON.parse(raw) as Session) : null
  } catch {
    currentSession = null
  }
  return currentSession
}
