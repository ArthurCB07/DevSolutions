import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as api from '../services/api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const s = await api.getSession()
    setSession(s)
    return s
  }, [])

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [refresh])

  const value = {
    loading,
    user: session?.user || null,
    tenant: session?.tenant || null,
    isAdmin: session?.user?.role === 'admin',
    impersonating: !!session?.impersonating,
    // A sessão entra após 900 ms para a tela de login mostrar a animação de sucesso.
    login: async (email, password) => { const s = await api.login(email, password); setTimeout(() => setSession(s), 900); return s },
    logout: async () => { await api.logout(); setSession(null) },
    impersonate: async (tenantId) => { const s = await api.impersonate(tenantId); setSession(s); return s },
    stopImpersonating: async () => { const s = await api.stopImpersonating(); setSession(s); return s },
    refresh,
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)

/** Dados da empresa que está sendo vista no portal do cliente. */
export function useTenant() {
  const { tenant, user } = useAuth()
  const owner = tenant?.owner || user?.name || ''
  const initials = owner.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
  return {
    ...tenant,
    client: tenant?.company || '',
    owner,
    firstName: (user?.role === 'client' ? user.name : owner).split(' ')[0],
    initials,
    planLabel: tenant ? `Plano ${tenant.plan}` : '',
    modules: tenant?.modules || {},
  }
}
