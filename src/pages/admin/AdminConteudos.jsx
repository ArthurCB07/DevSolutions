import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Newspaper, Plus, X, Pencil, Trash2, Loader2, BookOpen,
  MessageCircle, Megaphone, Workflow, Wallet, Globe, FileText, Target, MapPin, Calculator,
} from 'lucide-react'
import { Page, PageHead, Card, Toggle, Button, useToast, spring } from '../../components/ui.jsx'
import { Skeleton } from './AdminDashboard.jsx'
import { contentCategories } from '../../data.js'
import * as api from '../../services/api.js'

const ICONS = { MessageCircle, Megaphone, Workflow, Wallet, Globe, FileText, Target, MapPin, Calculator }
const COLORS = [['#2563eb', '#0ea5e9'], ['#16a34a', '#84cc16'], ['#f97316', '#ef4444'], ['#db2777', '#f59e0b'], ['#0ea5e9', '#6366f1'], ['#14b8a6', '#0ea5e9']]
const TYPES = ['Artigo', 'Guia', 'Checklist', 'Vídeo', 'Template', 'Planilha']
const empty = { title: '', excerpt: '', cat: 'vendas', type: 'Artigo', mins: 5, icon: 'FileText', color: COLORS[0], body: [''], published: true }

function Editor({ initial, onClose, onSaved }) {
  const toast = useToast()
  const [f, setF] = useState({ ...initial, bodyText: initial.body.join('\n\n') })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const Icon = ICONS[f.icon] || BookOpen

  const save = async () => {
    if (!f.title) return toast('Dê um título ao conteúdo', 'warn')
    setSaving(true)
    const { bodyText, ...rest } = f
    const saved = await api.saveContent({ ...rest, mins: Number(f.mins) || 1, body: bodyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) })
    setSaving(false)
    onSaved(saved)
    toast(saved.published ? 'Publicado para todos os clientes' : 'Rascunho salvo', saved.published ? 'ok' : 'info')
  }

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" style={{ width: 'min(760px, 100%)' }} onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }} transition={spring}>
        <motion.div layout className="cover" style={{ height: 130, background: `linear-gradient(135deg, ${f.color[0]}, ${f.color[1]})`, borderRadius: '24px 24px 0 0' }}>
          <motion.div key={f.icon} className="cover-icon" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={spring}><Icon size={30} /></motion.div>
          <motion.button className="icon-btn" whileHover={{ rotate: 90 }} onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,0.25)', color: 'white', border: 'none' }}><X size={16} /></motion.button>
        </motion.div>
        <div style={{ padding: 26, display: 'grid', gap: 14 }}>
          <div><label className="lbl">Título</label><input className="input" value={f.title} onChange={set('title')} placeholder="Ex: 5 dicas para vender mais" autoFocus /></div>
          <div><label className="lbl">Resumo</label><input className="input" value={f.excerpt} onChange={set('excerpt')} placeholder="Uma frase que aparece no card" /></div>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 110px' }}>
            <div><label className="lbl">Categoria</label>
              <select className="input" value={f.cat} onChange={set('cat')}>{contentCategories.filter((c) => c.value !== 'all').map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
            </div>
            <div><label className="lbl">Tipo</label>
              <select className="input" value={f.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div><label className="lbl">Minutos</label><input className="input" type="number" min="1" value={f.mins} onChange={set('mins')} /></div>
          </div>
          <div>
            <label className="lbl">Ícone e cor</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(ICONS).map(([name, I]) => (
                <motion.button key={name} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }} onClick={() => setF({ ...f, icon: name })}
                  className="icon-btn" style={f.icon === name ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)' } : undefined}><I size={17} /></motion.button>
              ))}
              <span style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 4px' }} />
              {COLORS.map((c, i) => (
                <motion.button key={i} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setF({ ...f, color: c })}
                  style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(135deg, ${c[0]}, ${c[1]})`, outline: f.color[0] === c[0] ? '2px solid var(--text)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div><label className="lbl">Texto (separe parágrafos com uma linha em branco)</label>
            <textarea className="input" rows={7} value={f.bodyText} onChange={set('bodyText')} style={{ resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Toggle on={f.published} onChange={(v) => setF({ ...f, published: v })} />
            <span style={{ fontSize: 14, flex: 1 }}>{f.published ? 'Publicado — visível para todos os clientes' : 'Rascunho — só a equipe vê'}</span>
            <Button className="primary" onClick={save} disabled={saving}>{saving ? <Loader2 size={16} className="spin" /> : 'Salvar'}</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function AdminConteudos() {
  const toast = useToast()
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => { api.listContents({ includeDrafts: true }).then(setItems) }, [])

  const onSaved = (c) => {
    setItems((xs) => (xs.some((x) => x.id === c.id) ? xs.map((x) => (x.id === c.id ? c : x)) : [c, ...xs]))
    setEditing(null)
  }
  const togglePublish = async (c) => {
    const saved = await api.saveContent({ ...c, published: !c.published })
    setItems((xs) => xs.map((x) => (x.id === c.id ? saved : x)))
    toast(saved.published ? 'Publicado' : 'Movido para rascunho', 'info')
  }

  const catLabel = (v) => contentCategories.find((c) => c.value === v)?.label || v

  return (
    <Page>
      <PageHead eyebrow={<><Newspaper size={14} /> Administração</>} title="Conteúdos" subtitle="Publique artigos e materiais que aparecem na área de aprendizado de todos os clientes.">
        <Button className="primary" onClick={() => setEditing(empty)}><Plus size={16} /> Novo conteúdo</Button>
      </PageHead>

      <Card style={{ padding: 10 }}>
        <div className="list">
          {!items && [0, 1, 2, 3].map((i) => <Skeleton key={i} h={56} style={{ margin: 8 }} />)}
          <AnimatePresence initial={false}>
            {items?.map((c, i) => {
              const I = ICONS[c.icon] || BookOpen
              return (
                <motion.div key={c.id} layout className="list-row" style={{ padding: '12px 10px' }}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} exit={{ opacity: 0, x: -40 }}>
                  <motion.div className="row-icon" style={{ background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`, color: 'white', width: 44, height: 44 }} whileHover={{ rotate: -10, scale: 1.1 }}>
                    <I size={19} />
                  </motion.div>
                  <div className="row-main">
                    <b>{c.title}</b>
                    <span>{catLabel(c.cat)} · {c.type} · {c.mins} min</span>
                  </div>
                  <span className={`pill ${c.published ? 'ok' : 'neutral'}`} style={{ minWidth: 86, justifyContent: 'center' }}>{c.published ? 'Publicado' : 'Rascunho'}</span>
                  <Toggle on={c.published} onChange={() => togglePublish(c)} />
                  <motion.button className="btn ghost sm" whileTap={{ scale: 0.85 }} onClick={() => setEditing(c)} aria-label="Editar"><Pencil size={15} /></motion.button>
                  <motion.button className="btn ghost sm danger" whileTap={{ scale: 0.85 }} aria-label="Excluir"
                    onClick={async () => { await api.deleteContent(c.id); setItems((xs) => xs.filter((x) => x.id !== c.id)); toast('Conteúdo excluído', 'warn') }}>
                    <Trash2 size={15} />
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </Card>

      <AnimatePresence>{editing && <Editor key="ed" initial={editing} onClose={() => setEditing(null)} onSaved={onSaved} />}</AnimatePresence>
    </Page>
  )
}
