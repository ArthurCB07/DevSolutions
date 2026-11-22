import { cloneElement, useEffect, useMemo, useState } from 'react'
import { Routes, Route, useLocation, useOutlet, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Code2, Eye, Lock, ArrowLeft } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import { ToastProvider, Button, Page } from './components/ui.jsx'
import { clientNav, adminNav, flatNav } from './components/nav.js'
import { AuthProvider, useAuth, useTenant } from './auth/AuthContext.jsx'
import { MODULES } from './services/api.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WhatsappBot from './pages/WhatsappBot.jsx'
import Status from './pages/Status.jsx'
import Dominio from './pages/Dominio.jsx'
import Clientes from './pages/Clientes.jsx'
import Conteudos from './pages/Conteudos.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminClientes from './pages/admin/AdminClientes.jsx'
import AdminConteudos from './pages/admin/AdminConteudos.jsx'
import AdminAuditoria from './pages/admin/AdminAuditoria.jsx'

function Ambient() {
  return (
    <div className="ambient">
      <div className="grid" />
      <motion.div className="blob" style={{ width: 520, height: 520, background: '#2563eb', top: -220, left: '25%' }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, 20, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="blob" style={{ width: 420, height: 420, background: '#0ea5e9', top: 160, right: -160 }}
        animate={{ x: [0, -70, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  )
}

function Splash() {
  return (
    <div className="splash">
      <motion.div className="brand-logo" style={{ width: 56, height: 56, borderRadius: 16 }}
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
        <Code2 size={28} />
      </motion.div>
    </div>
  )
}

/* ---------- Guards ----------
 * Redirect navega uma única vez ao montar. O <Navigate> do react-router navega a cada
 * renderização, o que entra em loop enquanto a tela antiga ainda está animando a saída. */
function Redirect({ to }) {
  const nav = useNavigate()
  useEffect(() => { nav(to, { replace: true }) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Redirect to="/login" />
  return children
}

function ClientOnly({ children }) {
  const { isAdmin, impersonating } = useAuth()
  if (isAdmin && !impersonating) return <Redirect to="/admin" />
  return children
}

function AdminOnly({ children }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Redirect to="/" />
  return children
}

function ModuleGate({ module, children }) {
  const t = useTenant()
  const nav = useNavigate()
  if (t.modules[module]) return children
  return (
    <Page>
      <div className="card locked">
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ width: 72, height: 72, borderRadius: 22, display: 'grid', placeItems: 'center', background: 'var(--accent-soft)', color: 'var(--accent)', marginBottom: 18 }}>
          <Lock size={32} />
        </motion.div>
        <h2 style={{ fontSize: 22 }}>{MODULES[module]} não está no seu plano</h2>
        <p style={{ color: 'var(--muted)', margin: '8px 0 20px', maxWidth: 420 }}>Fale com a DevSolutions para ativar este módulo no {t.planLabel}.</p>
        <Button className="primary" onClick={() => nav('/')}>Voltar ao painel</Button>
      </div>
    </Page>
  )
}

/* ---------- Shell (layout com menu + topo) ---------- */
function Shell({ variant, theme, setTheme }) {
  const location = useLocation()
  const outlet = useOutlet()
  const nav = useNavigate()
  const { user, impersonating, stopImpersonating } = useAuth()
  const tenant = useTenant()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const isAdmin = variant === 'admin'
  const groups = useMemo(() => (isAdmin ? adminNav : clientNav(tenant.modules)), [isAdmin, tenant.modules])
  const pages = useMemo(() => flatNav(groups), [groups])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o) }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }, [location.pathname])

  const leaveImpersonation = async () => { nav(`/admin/clientes?id=${tenant.id}`); await stopImpersonating() }

  return (
    <div className="app">
      <Sidebar groups={groups} variant={variant} planLabel={tenant.planLabel} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} />
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="overlay" style={{ zIndex: 25 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
      <div className="main">
        <AnimatePresence>
          {!isAdmin && impersonating && (
            <motion.div className="imp-banner" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <Eye size={16} />
              Você está vendo o painel de <b>{tenant.client}</b> como suporte DevSolutions.
              <button onClick={leaveImpersonation}><ArrowLeft size={14} style={{ verticalAlign: -2 }} /> Voltar ao admin</button>
            </motion.div>
          )}
        </AnimatePresence>
        <Topbar
          theme={theme}
          toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          openPalette={() => setPaletteOpen(true)}
          openMenu={() => setMobileOpen(true)}
          userName={isAdmin ? user?.name : tenant.owner}
          userSub={isAdmin ? 'Administrador' : tenant.client}
          initials={isAdmin ? 'DS' : tenant.initials}
          settingsPath={isAdmin ? null : '/configuracoes'}
        />
        <main className="content">
          <AnimatePresence mode="wait">
            {outlet && cloneElement(outlet, { key: location.pathname })}
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} pages={pages} showContents={!isAdmin} />
    </div>
  )
}

function LoginRoute() {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <Splash />
  if (user) return <Redirect to={isAdmin ? '/admin' : '/'} />
  return <Login />
}

function AppRoutes() {
  const location = useLocation()
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ds-theme-v2') || 'light' } catch { return 'light' }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('ds-theme-v2', theme) } catch {}
  }, [theme])

  const area = location.pathname === '/login' ? 'login' : location.pathname.startsWith('/admin') ? 'admin' : 'client'

  return (
    <>
      <Ambient />
      <AnimatePresence mode="wait">
        <motion.div key={area} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ position: 'relative', zIndex: 1 }}>
          <Routes location={location}>
            <Route path="/login" element={<LoginRoute />} />

            <Route path="/admin" element={<RequireAuth><AdminOnly><Shell variant="admin" theme={theme} setTheme={setTheme} /></AdminOnly></RequireAuth>}>
              <Route index element={<AdminDashboard />} />
              <Route path="clientes" element={<AdminClientes />} />
              <Route path="conteudos" element={<AdminConteudos />} />
              <Route path="auditoria" element={<AdminAuditoria />} />
            </Route>

            <Route path="/" element={<RequireAuth><ClientOnly><Shell variant="client" theme={theme} setTheme={setTheme} /></ClientOnly></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="whatsapp" element={<ModuleGate module="bot"><WhatsappBot /></ModuleGate>} />
              <Route path="status" element={<ModuleGate module="sistema"><Status /></ModuleGate>} />
              <Route path="dominio" element={<ModuleGate module="dominio"><Dominio /></ModuleGate>} />
              <Route path="clientes" element={<ModuleGate module="crm"><Clientes /></ModuleGate>} />
              <Route path="conteudos" element={<Conteudos />} />
              <Route path="configuracoes" element={<Configuracoes theme={theme} setTheme={setTheme} />} />
            </Route>

            <Route path="*" element={<Redirect to="/" />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
