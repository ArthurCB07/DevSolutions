import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  BookOpen, Clock, Bookmark, X, Search, GraduationCap, CheckCircle2,
  MessageCircle, Megaphone, Workflow, Wallet, Globe, FileText, Target, MapPin, Calculator,
} from 'lucide-react'

const Icons = { MessageCircle, Megaphone, Workflow, Wallet, Globe, FileText, Target, MapPin, Calculator }
import { Page, PageHead, Card, Item, Tabs, Progress, Button, useToast, spring } from '../components/ui.jsx'
import { contentCategories } from '../data.js'
import { listContents } from '../services/api.js'

function Cover({ c, height = 150, big = false }) {
  const Icon = Icons[c.icon] || BookOpen
  return (
    <motion.div layoutId={`cover-${c.id}`} className="cover" style={{ height, background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})` }}>
      <motion.div
        style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', right: -60, top: -80 }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div className="cover-icon" layoutId={`icon-${c.id}`} style={big ? { width: 84, height: 84, borderRadius: 24 } : undefined}>
        <Icon size={big ? 40 : 30} />
      </motion.div>
    </motion.div>
  )
}

export default function Conteudos() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [contents, setContents] = useState([])
  useEffect(() => { listContents().then(setContents) }, [])
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const [saved, setSaved] = useState(() => new Set(['c3']))
  const [read, setRead] = useState(() => new Set(['c2', 'c5']))
  const openId = params.get('c')
  const open = contents.find((c) => c.id === openId)

  const list = useMemo(
    () => contents.filter((c) => (cat === 'all' || c.cat === cat) && (!q || c.title.toLowerCase().includes(q.toLowerCase()))),
    [cat, q, contents]
  )

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setRead((r) => new Set(r).add(open.id))
    } else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const toggleSave = (id, e) => {
    e?.stopPropagation()
    setSaved((s) => {
      const n = new Set(s)
      if (n.has(id)) { n.delete(id); toast('Removido dos salvos', 'info') } else { n.add(id); toast('Salvo para ler depois') }
      return n
    })
  }

  return (
    <Page>
      <PageHead eyebrow={<><GraduationCap size={14} /> Conteúdos</>} title="Aprenda a crescer seu negócio" subtitle="Artigos, guias e modelos práticos sobre vendas, marketing, gestão e finanças.">
        <div className="search" style={{ minWidth: 260, cursor: 'text' }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conteúdo…" style={{ background: 'none', border: 'none', outline: 'none', flex: 1 }} />
        </div>
      </PageHead>

      <Card style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <b style={{ fontSize: 14 }}>Sua trilha empreendedora</b>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{read.size} de {contents.length} concluídos</span>
          </div>
          <Progress value={(read.size / contents.length) * 100} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {contents.map((c) => (
            <motion.span
              key={c.id}
              title={c.title}
              animate={{ background: read.has(c.id) ? c.color[0] : 'var(--panel-hover)', scale: read.has(c.id) ? 1 : 0.85 }}
              style={{ width: 14, height: 14, borderRadius: 5, display: 'block' }}
              transition={spring}
            />
          ))}
        </div>
      </Card>

      <Item style={{ marginBottom: 22 }}>
        <Tabs id="cat" tabs={contentCategories} value={cat} onChange={setCat} />
      </Item>

      <LayoutGroup>
        <motion.div layout className="grid g-3">
          <AnimatePresence mode="popLayout">
            {list.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring, delay: i * 0.04 } }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ y: -8 }}
                className="card content-card"
                onClick={() => setParams({ c: c.id })}
              >
                <Cover c={c} />
                <div className="content-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="pill info">{c.type}</span>
                    <motion.button whileTap={{ scale: 0.7 }} onClick={(e) => toggleSave(c.id, e)} aria-label="Salvar" style={{ color: saved.has(c.id) ? 'var(--accent)' : 'var(--faint)' }}>
                      <motion.span key={String(saved.has(c.id))} initial={{ scale: 0.4, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={spring} style={{ display: 'grid' }}>
                        <Bookmark size={18} fill={saved.has(c.id) ? 'currentColor' : 'none'} />
                      </motion.span>
                    </motion.button>
                  </div>
                  <motion.h3 layoutId={`title-${c.id}`}>{c.title}</motion.h3>
                  <p>{c.excerpt}</p>
                  <div className="content-meta">
                    <span><Clock size={13} /> {c.mins} min</span>
                    {read.has(c.id) && <span style={{ color: 'var(--success)' }}><CheckCircle2 size={13} /> Lido</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && <div className="empty">Nenhum conteúdo encontrado.</div>}

        <AnimatePresence>
          {open && (
            <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setParams({})}>
              <motion.div layoutId={undefined} className="modal" onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} transition={spring}
              >
                <div style={{ position: 'relative' }}>
                  <Cover c={open} height={220} big />
                  <motion.button className="icon-btn" whileHover={{ rotate: 90 }} onClick={() => setParams({})}
                    style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.35)', color: 'white', border: 'none' }}>
                    <X size={18} />
                  </motion.button>
                </div>
                <div className="article">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '22px 0 0' }}>
                    <span className="pill info">{open.type}</span>
                    <span className="content-meta" style={{ marginTop: 0 }}><span><Clock size={13} /> {open.mins} min de leitura</span></span>
                  </div>
                  <motion.h3 layoutId={`title-${open.id}`} style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '12px 0 18px', lineHeight: 1.25 }}>{open.title}</motion.h3>
                  {open.body.map((p, i) => (
                    <motion.p key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.1 }}>{p}</motion.p>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                    <Button className="primary" onClick={() => setParams({})}><CheckCircle2 size={16} /> Concluir leitura</Button>
                    <Button onClick={() => toggleSave(open.id)}>
                      <Bookmark size={16} fill={saved.has(open.id) ? 'currentColor' : 'none'} /> {saved.has(open.id) ? 'Salvo' : 'Salvar'}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </Page>
  )
}
