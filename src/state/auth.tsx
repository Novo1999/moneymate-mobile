import { addAccount, listAccounts } from '@/lib/api/accountType'
import {
  getCurrentUser,
  login as apiLogin,
  loginWithGoogleIdToken,
  logout as apiLogout,
  register as apiRegister,
  updateUser as apiUpdateUser,
} from '@/lib/api/auth'
import { setOnAuthExpired } from '@/lib/api/client'
import { signInWithGoogle, signOutFromGoogle } from '@/lib/googleSignin'
import { getRefreshToken, loadSession, persistSession } from '@/lib/session'
import { activeAccountIdAtom, authStatusAtom, userAtom } from '@/state/atoms'
import type { LoginPayload, RegisterPayload, UpdateUserPayload, User } from '@/types/auth'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect, type ReactNode } from 'react'

async function resolveActiveAccountId(user: User): Promise<number | null> {
  if (user.activeAccountTypeId) return user.activeAccountTypeId
  try {
    const accounts = await listAccounts()
    return accounts[0]?.id ?? null
  } catch {
    return null
  }
}

/** Bootstraps the persisted session on launch and wires forced-logout on token expiry. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useSetAtom(userAtom)
  const setStatus = useSetAtom(authStatusAtom)
  const setActiveAccountId = useSetAtom(activeAccountIdAtom)

  useEffect(() => {
    setOnAuthExpired(() => {
      setUser(null)
      setActiveAccountId(null)
      setStatus('unauthenticated')
    })

    let active = true
    ;(async () => {
      const session = await loadSession()
      if (!session) {
        if (active) setStatus('unauthenticated')
        return
      }
      try {
        const me = await getCurrentUser()
        if (!active) return
        setUser(me)
        setActiveAccountId(await resolveActiveAccountId(me))
        setStatus('authenticated')
      } catch {
        await persistSession(null)
        if (active) setStatus('unauthenticated')
      }
    })()

    return () => {
      active = false
      setOnAuthExpired(null)
    }
  }, [setUser, setStatus, setActiveAccountId])

  return <>{children}</>
}

export function useAuth() {
  const [user, setUser] = useAtom(userAtom)
  const [status, setStatus] = useAtom(authStatusAtom)
  const [activeAccountId, setActiveAccountIdState] = useAtom(activeAccountIdAtom)

  const establishSession = async (tokens: { accessToken: string; refreshToken: string }) => {
    await persistSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
    const me = await getCurrentUser()
    setUser(me)
    setActiveAccountIdState(await resolveActiveAccountId(me))
    setStatus('authenticated')
  }

  const login = async (payload: LoginPayload) => {
    const data = await apiLogin(payload)
    await establishSession(data)
  }

  const loginWithGoogle = async (): Promise<{ cancelled: boolean }> => {
    const result = await signInWithGoogle()
    const idToken = result.data?.idToken
    if (result.type === 'cancelled' || !idToken) return { cancelled: true }
    const data = await loginWithGoogleIdToken({ idToken })
    await establishSession(data)
    return { cancelled: false }
  }

  const register = async (payload: RegisterPayload) => {
    await apiRegister(payload)
    // Auto-login, then provision a default "Cash" account and persist currency + active account.
    const data = await apiLogin({ email: payload.email, password: payload.password })
    await persistSession({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    try {
      const account = await addAccount({ name: 'Cash', balance: 0 })
      await apiUpdateUser(data.id, { currency: payload.currency, activeAccountTypeId: account.id })
    } catch {
      // Non-fatal — user still has a session; account can be created later.
    }
    const me = await getCurrentUser()
    setUser(me)
    setActiveAccountIdState(await resolveActiveAccountId(me))
    setStatus('authenticated')
  }

  const logout = async () => {
    try {
      await apiLogout(getRefreshToken())
    } catch {
      // clear local session regardless
    }
    await signOutFromGoogle()
    await persistSession(null)
    setUser(null)
    setActiveAccountIdState(null)
    setStatus('unauthenticated')
  }

  const refreshUser = async () => {
    const me = await getCurrentUser()
    setUser(me)
  }

  const updateUser = async (payload: UpdateUserPayload) => {
    if (!user) return
    await apiUpdateUser(user.id, payload)
    setUser({ ...user, ...payload } as User)
  }

  const setActiveAccount = async (id: number) => {
    setActiveAccountIdState(id)
    if (user) {
      try {
        await apiUpdateUser(user.id, { activeAccountTypeId: id })
        setUser({ ...user, activeAccountTypeId: id })
      } catch {
        // selection still applies for this session
      }
    }
  }

  return {
    user,
    status,
    activeAccountId,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
    updateUser,
    setActiveAccount,
  }
}
