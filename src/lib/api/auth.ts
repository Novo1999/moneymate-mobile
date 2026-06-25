import type { GoogleNativePayload, LoginData, LoginPayload, RegisterPayload, UpdateUserPayload, User } from '@/types/auth'
import { apiClient, requireApiData } from './client'

export async function login(payload: LoginPayload): Promise<LoginData> {
  const res = await apiClient<LoginData>('/auth/login', { method: 'POST', body: payload })
  return requireApiData(res, 'Invalid email or password')
}

export async function register(payload: RegisterPayload): Promise<{ email: string; name: string }> {
  const res = await apiClient<{ email: string; name: string }>('/auth/signUp', { method: 'POST', body: payload })
  return requireApiData(res, 'Registration failed')
}

export async function loginWithGoogleIdToken(payload: GoogleNativePayload): Promise<LoginData> {
  const res = await apiClient<LoginData>('/auth/google', { method: 'POST', body: payload })
  return requireApiData(res, 'Google sign-in failed')
}

export async function logout(refreshToken: string | null): Promise<void> {
  await apiClient<null>('/auth/logout', { method: 'POST', body: { refreshToken } })
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiClient<User>('/auth/me')
  return requireApiData(res, 'Failed to load your profile')
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<void> {
  await apiClient(`/auth/user/${id}`, { method: 'PATCH', body: payload })
}
