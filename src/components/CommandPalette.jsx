import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, BookOpen, CornerDownLeft } from 'lucide-react'
import { contents } from '../data.js'
import { spring } from './ui.jsx'

export default function CommandPalette({ open, onClose, pages: pageList = [], showContents = true }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const navigate = useNavigate()

  const items = useMemo(() => {
    const pages = pageList.map((n) => ({ label: n.label, icon: n.icon, hint: 'Página', go: n.to }))
    const arts = showContents ? contents.map((c) => ({ label: c.title, icon: BookOpen, hint: c.type, go: `/conteudos?c=${c.id}` })) : []
    const all = [...pages, ...arts]
    const t = q.trim().toLowerCase()
    return t ? all.filter((i) => i.label.toLowerCase().includes(t)) : all.slice(0, 9)
  }, [q, pageList, showContents])

  useEffect(() => { if (open) { setQ(''); setSel(0) } }, [open])
  useEffect(() => setSel(0), [q])

  const choose = (item) => { navigate(item.go); onClose() }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && items[sel]) choose(items[sel])
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="palette"
            initial={{ opacity: 0, y: -30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={spring}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="palette-input">
              <Search size={18} color="var(--muted)" />
              <input autoFocus placeholder="O que você procura?" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
              <span className="kbd">Esc</span>
            </div>
            <div className="palette-list">
              <AnimatePresence initial={false} mode="popLayout">
                {items.length === 0 && (
                  <motion.div key="empty" className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Nada encontrado para “{q}”.</motion.div>
                )}
                {items.map((item, i) => (
                  <motion.button
                    layout
                    key={item.go}
                    className="palette-item"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => choose(item)}
                  >
                    {sel === i && <motion.span layoutId="pal-hl" className="hl" transition={spring} />}
                    <item.icon size={17} color={sel === i ? 'var(--accent-2)' : 'var(--muted)'} />
                    <b style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</b>
                    <span>{sel === i ? <CornerDownLeft size={14} /> : item.hint}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
