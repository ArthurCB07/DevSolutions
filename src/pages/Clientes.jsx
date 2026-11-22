import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { Users, Plus, Search, X, Phone, TrendingUp, Trophy, Target } from 'lucide-react'
import { Page, PageHead, Card, Counter, IconBox, Button, Item, useToast, spring } from '../components/ui.jsx'
import { leadsInitial, columns } from '../data.js'

const tagColor = { WhatsApp: '#16a34a', Indicação: '#2563eb', Instagram: '#ec4899', Site: '#0ea5e9' }
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export default function Clientes() {
  const toast = useToast()
  const [board, setBoard] = useState(leadsInitial)
  const [dragging, setDragging] = useState(null) // { id, from }
  const [over, setOver] = useState(null)
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', value: '', tag: 'WhatsApp' })

  const move = (id, from, to, beforeId = null) => {
    if (!from || !to) return
    setBoard((b) => {
      const card = b[from].find((c) => c.id === id)
      if (!card) return b
      const next = { ...b, [from]: b[from].filter((c) => c.id !== id) }
      const list = [...next[to]]
      const idx = beforeId ? list.findIndex((c) => c.id === beforeId) : -1
      idx >= 0 ? list.splice(idx, 0, card) : list.push(card)
      next[to] = list
      return next
    })
    if (from !== to) {
      const title = columns.find((c) => c.id === to).title
      toast(to === 'fechado' ? '🎉 Negócio fechado!' : `Movido para "${title}"`, to === 'fechado' ? 'ok' : 'info')
    }
  }

  const onDrop = (to, beforeId = null) => {
    if (dragging) move(dragging.id, dragging.from, to, beforeId)
    setDragging(null)
    setOver(null)
  }

  const addLead = () => {
    if (!form.name) return toast('Informe o nome do cliente', 'warn')
    setBoard((b) => ({ ...b, novo: [{ ...form, value: Number(form.value) || 0, id: 'l' + Date.now() }, ...b.novo] }))
    setForm({ name: '', contact: '', value: '', tag: 'WhatsApp' })
    setModal(false)
    toast('Cliente adicionado ao funil')
  }

  const all = Object.values(board).flat()
  const total = all.reduce((s, c) => s + c.value, 0)
  const won = board.fechado.reduce((s, c) => s + c.value, 0)
  const filter = (c) => !q || `${c.name} ${c.contact}`.toLowerCase().includes(q.toLowerCase())

  return (
    <Page>
      <PageHead eyebrow={<><Users size={14} /> Clientes (CRM)</>} title="Funil de clientes" subtitle="Arraste os cartões entre as colunas para acompanhar cada negociação.">
        <div className="search" style={{ minWidth: 240, cursor: 'text' }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente…" style={{ background: 'none', border: 'none', outline: 'none', flex: 1 }} />
        </div>
        <Button className="primary" onClick={() => setModal(true)}><Plus size={16} /> Novo cliente</Button>
      </PageHead>

      <div className="grid g-3" style={{ marginBottom: 20 }}>
        {[
          { icon: Target, color: '#2563eb', label: 'Valor no funil', node: <Counter value={total} prefix="R$ " /> },
          { icon: Trophy, color: '#22c55e', label: 'Fechado no mês', node: <Counter value={won} prefix="R$ " /> },
          { icon: TrendingUp, color: '#0ea5e9', label: 'Taxa de conversão', node: <Counter value={all.length ? (board.fechado.length / all.length) * 100 : 0} suffix="%" decimals={1} /> },
        ].map((s) => (
          <Card key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <IconBox icon={s.icon} color={s.color} />
            <div>
              <div className="kpi-value" style={{ marginTop: 0, fontSize: 24 }}>{s.node}</div>
              <div className="kpi-label">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Item>
        <LayoutGroup>
          <div className="kanban">
            {columns.map((col) => {
              const items = board[col.id].filter(filter)
              const sum = board[col.id].reduce((s, c) => s + c.value, 0)
              return (
                <motion.div
                  key={col.id}
                  layout
                  className={`k-col ${over === col.id ? 'over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setOver(col.id) }}
                  onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null) }}
                  onDrop={(e) => { e.preventDefault(); onDrop(col.id) }}
                  animate={{ scale: over === col.id ? 1.015 : 1 }}
                  transition={spring}
                >
                  <div className="k-head">
                    <motion.span style={{ width: 10, height: 10, borderRadius: 4, background: col.color }} animate={{ rotate: over === col.id ? 45 : 0 }} />
                    {col.title}
                    <motion.span key={items.length} className="k-count" initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={spring}>{items.length}</motion.span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '0 6px 12px' }}>{brl(sum)}</div>
                  <div className="k-list">
                    <AnimatePresence mode="popLayout">
                      {items.map((c) => (
                        <motion.div
                          key={c.id}
                          layout
                          layoutId={c.id}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={spring}
                          whileHover={{ y: -3 }}
                        >
                          <div
                            draggable
                            className={`k-card ${dragging?.id === c.id ? 'dragging' : ''}`}
                            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragging({ id: c.id, from: col.id }) }}
                            onDragEnd={() => { setDragging(null); setOver(null) }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(col.id, c.id) }}
                            style={{ borderLeft: `3px solid ${col.color}` }}
                          >
                            <h5>{c.name}</h5>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {c.contact || '—'}</p>
                            <div className="k-meta">
                              <span className="pill" style={{ color: tagColor[c.tag], background: `color-mix(in srgb, ${tagColor[c.tag]} 15%, transparent)` }}>{c.tag}</span>
                              <b>{brl(c.value)}</b>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <AnimatePresence>
                      {dragging && dragging.from !== col.id && (
                        <motion.div className="k-ghost" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 80 }} exit={{ opacity: 0, height: 0 }}>
                          Solte aqui
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </LayoutGroup>
      </Item>

      <AnimatePresence>
        {modal && (
          <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div
              className="modal" style={{ width: 'min(460px, 100%)', padding: 26 }}
              initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={spring} onClick={(e) => e.stopPropagation()}
            >
              <div className="card-head">
                <div className="card-title" style={{ fontSize: 18 }}>Novo cliente</div>
                <motion.button className="icon-btn" whileHover={{ rotate: 90 }} onClick={() => setModal(false)}><X size={16} /></motion.button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['name', 'Empresa / nome'], ['contact', 'Pessoa de contato'], ['value', 'Valor estimado (R$)'],
                ].map(([k, ph], i) => (
                  <motion.input
                    key={k} className="input" placeholder={ph} value={form[k]} type={k === 'value' ? 'number' : 'text'}
                    autoFocus={i === 0}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i + 0.1 }}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addLead()}
                  />
                ))}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.keys(tagColor).map((t) => (
                    <motion.button
                      key={t} whileTap={{ scale: 0.9 }} onClick={() => setForm({ ...form, tag: t })}
                      className="pill"
                      animate={{
                        background: form.tag === t ? tagColor[t] : 'rgba(127,127,127,0.12)',
                        color: form.tag === t ? '#fff' : 'var(--muted)',
                      }}
                      style={{ padding: '7px 12px', fontSize: 12.5 }}
                    >{t}</motion.button>
                  ))}
                </div>
                <Button className="primary" onClick={addLead} style={{ marginTop: 6 }}>Adicionar ao funil</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Page>
  )
}
