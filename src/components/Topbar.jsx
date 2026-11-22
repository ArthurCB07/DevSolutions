import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, Search, Sun, ShieldCheck, Bot, Rocket, LogOut, Settings, ChevronDown } from 'lucide-react'
import { spring } from './ui.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

function UserMenu({ name, subtitle, initials, settingsPath }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button className="user-chip" whileHover={{ y: -2 }} transition={spring} onClick={() => setOpen((o) => !o)}>
        <div className="avatar">{initials}</div>
        <div style={{ textAlign: 'left' }}>
          <b>{name}</b>
          <span>{subtitle}</span>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'grid', color: 'var(--faint)' }}><ChevronDown size={16} /></motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={spring}
            style={{ position: 'absolute', right: 0, top: 54, width: 240, transformOrigin: 'top right', background: 'var(--panel-solid)', border: '1px solid var(--border)', borderRadius: 16, padding: 8, boxShadow: 'var(--shadow)', zIndex: 40 }}
          >
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
              <b style={{ fontSize: 14 }}>{user?.name}</b>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
            {settingsPath && (
              <motion.button className="palette-item" whileHover={{ x: 4 }} onClick={() => { setOpen(false); nav(settingsPath) }}>
                <Settings size={16} /> Configurações
              </motion.button>
            )}
            <motion.button className="palette-item" whileHover={{ x: 4 }} style={{ color: 'var(--danger)' }}
              onClick={async () => { await logout(); nav('/login', { replace: true }) }}>
              <LogOut size={16} /> Sair
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const notifications = [
  { icon: ShieldCheck, color: 'var(--success)', title: 'SSL renovado com sucesso', time: 'há 3 h' },
  { icon: Bot, color: 'var(--wa)', title: 'Bot atingiu 18 mil mensagens no mês', time: 'há 5 h' },
  { icon: Rocket, color: 'var(--accent)', title: 'Nova versão do sistema disponível', time: 'ontem' },
]

export default function Topbar({ theme, toggleTheme, openPalette, openMenu, userName, userSub, initials, settingsPath }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [unread, setUnread] = useState(true)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={openMenu} aria-label="Abrir menu"><Menu size={18} /></button>

      <motion.button className="search" onClick={openPalette} whileTap={{ scale: 0.98 }}>
        <Search size={17} />
        <span className="search-text">Buscar páginas, conteúdos, ações…</span>
        <span className="kbd">Ctrl K</span>
      </motion.button>

      <div className="top-actions">
        <motion.button className="icon-btn" onClick={toggleTheme} whileTap={{ scale: 0.85 }} aria-label="Alternar tema">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -120, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 120, scale: 0, opacity: 0 }}
              transition={spring}
              style={{ display: 'grid' }}
            >
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        <div ref={ref} style={{ position: 'relative' }}>
          <motion.button
            className="icon-btn"
            onClick={() => { setNotifOpen((o) => !o); setUnread(false) }}
            whileTap={{ scale: 0.85 }}
            aria-label="Notificações"
          >
            <motion.span
              style={{ display: 'grid' }}
              animate={unread ? { rotate: [0, -18, 16, -10, 8, 0] } : {}}
              transition={{ duration: 0.9, repeat: unread ? Infinity : 0, repeatDelay: 2.5 }}
            >
              <Bell size={18} />
            </motion.span>
            <AnimatePresence>{unread && <motion.span className="dot-badge" exit={{ scale: 0 }} />}</AnimatePresence>
          </motion.button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={spring}
                style={{
                  position: 'absolute', right: 0, top: 50, width: 320, transformOrigin: 'top right',
                  background: 'var(--panel-solid)', border: '1px solid var(--border-strong)', borderRadius: 16, padding: 8, boxShadow: 'var(--shadow)',
                }}
              >
                <div style={{ padding: '10px 12px', fontWeight: 700, fontSize: 14 }}>Notificações</div>
                {notifications.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.05 }}
                    whileHover={{ backgroundColor: 'var(--panel-hover)' }}
                    style={{ display: 'flex', gap: 12, padding: 12, borderRadius: 12, alignItems: 'center' }}
                  >
                    <div className="row-icon" style={{ background: `color-mix(in srgb, ${n.color} 15%, transparent)`, color: n.color }}><n.icon size={18} /></div>
                    <div className="row-main"><b style={{ whiteSpace: 'normal' }}>{n.title}</b><span>{n.time}</span></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <UserMenu name={userName} subtitle={userSub} initials={initials} settingsPath={settingsPath} />
      </div>
    </header>
  )
}
