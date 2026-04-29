import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import api, { configureAxios } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { AuthUser, LoginInput, RegisterInput } from '@/features/auth/types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signIn: (input: LoginInput) => Promise<void>
  signUp: (input: RegisterInput) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const tokenRef = useRef<string | null>(null)

  const doRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
      tokenRef.current = res.data.data.accessToken
      return tokenRef.current
    } catch {
      return null
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    tokenRef.current = null
    setUser(null)
  }, [])

  // Wire axios interceptors once
  useEffect(() => {
    configureAxios(
      () => tokenRef.current,
      doRefresh,
      () => {
        tokenRef.current = null
        setUser(null)
      },
    )
  }, [doRefresh])

  // Restore session on mount using the refresh cookie
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const newToken = await doRefresh()
      if (cancelled || !newToken) {
        setLoading(false)
        return
      }
      tokenRef.current = newToken

      try {
        const res = await api.get<ApiResponse<AuthUser>>('/auth/me')
        if (!cancelled) setUser(res.data.data)
      } catch {
        tokenRef.current = null
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [doRefresh])

  const signIn = useCallback(async (input: LoginInput) => {
    const res = await api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>('/auth/login', input)
    tokenRef.current = res.data.data.accessToken
    setUser(res.data.data.user)
  }, [])

  const signUp = useCallback(async (input: RegisterInput) => {
    const res = await api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>('/auth/register', input)
    tokenRef.current = res.data.data.accessToken
    setUser(res.data.data.user)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<AuthUser>>('/auth/me')
      setUser(res.data.data)
    } catch {
      // ignore – user stays as-is
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
