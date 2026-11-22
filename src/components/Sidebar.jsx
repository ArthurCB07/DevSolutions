import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Code2, PanelLeftClose, PanelLeftOpen, Sparkles, ShieldCheck } from 'lucide-react'
import { spring, softSpring, Button } from './ui.jsx'

const fade = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { delay: 0.08 } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.1 } },
}

export default function Sidebar({ groups, variant = 'client', planLabel, collapsed, setCollapsed, mobileOpen }) {
  const { pathname } = useLocation()
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 860
  const narrow = collapsed && !isMobile
  const isAdmin = variant === 'admin'
  const layoutKey = isAdmin ? 'adm' : 'cli'

  const isActive = (item) => {
    if (item.to === '/' || item.end) return pathname === item.to
    return pathname.startsWith(item.to)
  }

  return (
    <motion.aside
      className={`sidebar ${isAdmin ? 'admin' : ''} ${!mobileOpen ? 'mobile-hidden' : ''}`}
      animate={{ width: narrow ? 84 : 260 }}
      transition={softSpring}
    >
      <div className="brand">
        <motion.div className="brand-logo" whileHover={{ rotate: 360, scale: 1.08 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <Code2 size={22} />
        </motion.div>
        <AnimatePresence>
          {!narrow && (
            <motion.div {...fade}>
              <div className="brand-name">DevSolutions{isAdmin && <span className="admin-chip">ADMIN</span>}</div>
              <div className="brand-sub">{isAdmin ? 'Gestão de clientes' : 'Painel do cliente'}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {groups.map((group, gi) => (
          <div key={group.label}>
            <AnimatePresence initial={false}>
              {!narrow ? (
                <motion.div className="nav-label" {...fade}>{group.label}</motion.div>
              ) : (
                gi > 0 && <motion.div style={{ height: 1, background: 'var(--border)', margin: '10px 12px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {group.items.map((item, i) => {
                const active = isActive(item)
                const Icon = item.icon
                return (
                  <motion.div key={item.to} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring}>
                    <NavLink to={item.to} end={item.end} className={`nav-item ${active ? 'active' : ''}`} title={narrow ? item.label : undefined}>
                      {active && (
                        <>
                          <motion.span layoutId={`nav-bg-${layoutKey}`} className="nav-bg" transition={spring} />
                          <motion.span layoutId={`nav-bar-${layoutKey}`} className="nav-bar" transition={spring} />
                        </>
                      )}
                      <motion.span
                        className="nav-icon"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: active ? 1.12 : 1, color: active ? 'var(--accent)' : 'currentColor' }}
                        whileHover={{ scale: 1.25, rotate: -8 }}
                        transition={{ ...spring, delay: 0.02 * (gi * 3 + i) }}
                      >
                        <Icon size={19} />
                      </motion.span>
                      <AnimatePresence>
                        {!narrow && (
                          <motion.span {...fade} style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                            {item.label}
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <AnimatePresence>
          {!narrow && (
            <motion.div
              className="plan-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.12 } }}
              exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.12 } }}
            >
              <motion.div
                style={{ position: 'absolute', right: -8, top: -8, color: 'var(--accent)', opacity: 0.25 }}
                animate={{ rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {isAdmin ? <ShieldCheck size={56} /> : <Sparkles size={56} />}
              </motion.div>
              {isAdmin ? (
                <>
                  <h4>Área restrita</h4>
                  <p>Ações ficam no registro de atividades</p>
                </>
              ) : (
                <>
                  <h4>{planLabel}</h4>
                  <p>Suporte prioritário ativo</p>
                  <Button className="primary sm" style={{ width: '100%' }}>Falar com a DevSolutions</Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {!isMobile && (
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <motion.span className="nav-icon" key={String(collapsed)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={spring}>
              {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </motion.span>
            <AnimatePresence>{!narrow && <motion.span {...fade}>Recolher menu</motion.span>}</AnimatePresence>
          </button>
        )}
      </div>
    </motion.aside>
  )
}
