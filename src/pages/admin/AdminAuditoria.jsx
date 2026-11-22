import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollText, Search, ShieldCheck, LogIn, Eye, KeyRound } from 'lucide-react'
import { Page, PageHead, Card, spring } from '../../components/ui.jsx'
import { Skeleton } from './AdminDashboard.jsx'
import { listAudit } from '../../services/api.js'

function iconFor(what) {
  if (what.includes('entrou')) return [LogIn, '#16a34a']
  if (what.includes('suporte')) return [Eye, '#d97706']
  if (what.includes('senha')) return [KeyRound, '#db2777']
  return [ShieldCheck, '#2563eb']
}

export default function AdminAuditoria() {
  const [items, setItems] = useState(null)
  const [q, setQ] = useState('')
  useEffect(() => { listAudit().then(setItems) }, [])

  const list = useMemo(() => (items || []).filter((a) => !q || `${a.who} ${a.what} ${a.tenant || ''}`.toLowerCase().includes(q.toLowerCase())), [items, q])

  return (
    <Page>
      <PageHead eyebrow={<><ScrollText size={14} /> Segurança</>} title="Registro de atividades" subtitle="Quem fez o quê e quando — logins, acessos de suporte e alterações nos clientes.">
        <div className="search" style={{ minWidth: 260, cursor: 'text' }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar por pessoa, ação, cliente…" style={{ background: 'none', border: 'none', outline: 'none', flex: 1 }} />
        </div>
      </PageHead>
      <Card>
        <div style={{ position: 'relative', paddingLeft: 30 }}>
          <motion.div style={{ position: 'absolute', left: 13, top: 8, bottom: 8, width: 2, background: 'var(--border)', transformOrigin: 'top' }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, delay: 0.2 }} />
          {!items && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} h={44} style={{ marginBottom: 14 }} />)}
          <AnimatePresence initial={false}>
            {list.map((a, i) => {
              const [I, color] = iconFor(a.what)
              return (
                <motion.div key={a.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i, 15) * 0.04 } }} exit={{ opacity: 0, height: 0 }}
                  style={{ position: 'relative', padding: '10px 0 14px' }}>
                  <motion.span whileHover={{ scale: 1.2 }} transition={spring}
                    style={{ position: 'absolute', left: -30, top: 8, width: 28, height: 28, borderRadius: 9, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${color} 12%, var(--panel-solid))`, color }}>
                    <I size={15} />
                  </motion.span>
                  <div style={{ fontSize: 14, paddingLeft: 10 }}>
                    <b>{a.who}</b> <span style={{ color: 'var(--muted)' }}>{a.what}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', paddingLeft: 10, marginTop: 3, display: 'flex', gap: 10 }}>
                    <span className="mono" style={{ fontSize: 12 }}>{a.at}</span>
                    {a.tenant && <span>· {a.tenant}</span>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {items && list.length === 0 && <div className="empty">Nada encontrado.</div>}
        </div>
      </Card>
    </Page>
  )
}
