import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion'
import { MessageCircle, GripVertical, Send, RotateCcw, Zap, Clock, Smile, QrCode, Plus, Bot } from 'lucide-react'
import { Page, PageHead, Card, Counter, IconBox, Toggle, Button, useToast, spring } from '../components/ui.jsx'
import { botFlows, botScript } from '../data.js'
import { useTenant } from '../auth/AuthContext.jsx'

function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function autoReply(text) {
  const t = text.toLowerCase()
  if (t.includes('card') || t === '1') return 'Aqui está o cardápio de hoje 🥐\n• Pão francês — R$ 0,90\n• Croissant — R$ 7,50\n• Bolo de cenoura — R$ 32,00'
  if (t.includes('hor')) return 'Funcionamos de segunda a sábado, das 6h às 20h. 🕕'
  if (t.includes('atend') || t === '3') return 'Certo! Vou te transferir para um atendente. Aguarde um instante 🙂'
  return 'Entendi! Um momento que já te ajudo. 😉'
}

function FlowItem({ flow, onToggle }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={flow}
      dragListener={false}
      dragControls={controls}
      className="flow-item"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)', zIndex: 5 }}
      transition={spring}
    >
      <span className="grip" onPointerDown={(e) => controls.start(e)} style={{ cursor: 'grab', touchAction: 'none' }}>
        <GripVertical size={18} />
      </span>
      <div className="row-main">
        <b>{flow.name}</b>
        <span>{flow.desc} · {flow.hits.toLocaleString('pt-BR')} usos</span>
      </div>
      <Toggle on={flow.active} onChange={() => onToggle(flow.id)} />
    </Reorder.Item>
  )
}

export default function WhatsappBot() {
  const toast = useToast()
  const company = useTenant()
  const [online, setOnline] = useState(true)
  const [flows, setFlows] = useState(botFlows)
  const [msgs, setMsgs] = useState([])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const [run, setRun] = useState(0)
  const bodyRef = useRef(null)

  // Replay the demo script with typing delays
  useEffect(() => {
    setMsgs([])
    let cancelled = false
    const timers = []
    let t = 400
    botScript.forEach((m) => {
      if (m.from === 'out') {
        timers.push(setTimeout(() => !cancelled && setTyping(true), t))
        t += 1100
      }
      timers.push(setTimeout(() => {
        if (cancelled) return
        setTyping(false)
        setMsgs((ms) => [...ms, { ...m, time: now(), id: Math.random() }])
      }, t))
      t += 700
    })
    return () => { cancelled = true; timers.forEach(clearTimeout) }
  }, [run])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, typing])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMsgs((ms) => [...ms, { from: 'in', text, time: now(), id: Math.random() }])
    if (!online) return
    setTimeout(() => setTyping(true), 300)
    setTimeout(() => {
      setTyping(false)
      setMsgs((ms) => [...ms, { from: 'out', text: autoReply(text), time: now(), id: Math.random() }])
    }, 1500)
  }

  const toggleFlow = (id) => setFlows((fs) => fs.map((f) => (f.id === id ? { ...f, active: !f.active } : f)))

  return (
    <Page>
      <PageHead
        eyebrow={<><MessageCircle size={14} /> Bot de WhatsApp</>}
        title="Seu atendente que nunca dorme"
        subtitle="Acompanhe conversas, ative fluxos e teste o bot em tempo real."
      >
        <Card style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <motion.span
            className="status-dot"
            animate={{ background: online ? 'var(--success)' : 'var(--danger)' }}
          />
          <AnimatePresence mode="wait">
            <motion.b key={String(online)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ fontSize: 14, minWidth: 92 }}>
              {online ? 'Bot ativo' : 'Bot pausado'}
            </motion.b>
          </AnimatePresence>
          <Toggle on={online} onChange={(v) => { setOnline(v); toast(v ? 'Bot reativado' : 'Bot pausado — mensagens irão para a fila', v ? 'ok' : 'warn') }} />
        </Card>
      </PageHead>

      <div className="grid g-4">
        {[
          { icon: MessageCircle, color: '#16a34a', label: 'Conversas hoje', value: 412 },
          { icon: Zap, color: '#2563eb', label: 'Resolvidas pelo bot', value: 87, suffix: '%' },
          { icon: Clock, color: '#0ea5e9', label: 'Tempo médio de resposta', value: 2.4, suffix: 's', decimals: 1 },
          { icon: Smile, color: '#f59e0b', label: 'Satisfação', value: 4.8, suffix: '/5', decimals: 1 },
        ].map((s) => (
          <Card key={s.label} tilt whileHover={{ y: -6 }}>
            <IconBox icon={s.icon} color={s.color} />
            <div className="kpi-value"><Counter value={s.value} suffix={s.suffix} decimals={s.decimals} /></div>
            <div className="kpi-label">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid g-main mt">
        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Fluxos de conversa</div>
              <div className="card-sub">Arraste pela alça para mudar a prioridade do menu</div>
            </div>
            <Button className="sm" onClick={() => {
              const id = 'f' + Date.now()
              setFlows((fs) => [...fs, { id, name: 'Novo fluxo', desc: 'Clique para editar', hits: 0, active: false }])
              toast('Fluxo criado', 'info')
            }}><Plus size={15} /> Novo fluxo</Button>
          </div>
          <Reorder.Group axis="y" values={flows} onReorder={setFlows} style={{ listStyle: 'none' }}>
            <AnimatePresence initial={false}>
              {flows.map((f) => <FlowItem key={f.id} flow={f} onToggle={toggleFlow} />)}
            </AnimatePresence>
          </Reorder.Group>

          <div className="card-head mt" style={{ marginBottom: 12 }}>
            <div className="card-title">Conexão</div>
          </div>
          <div className="list-row" style={{ borderBottom: 'none' }}>
            <IconBox icon={QrCode} color="#25d366" size={38} iconSize={18} className="row-icon" />
            <div className="row-main"><b>+55 (11) 98888-1234</b><span>WhatsApp Business · conectado há 41 dias</span></div>
            <Button className="sm ghost" onClick={() => toast('Novo QR Code gerado', 'info')}>Reconectar</Button>
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Teste o seu bot</div>
              <div className="card-sub">Simulação ao vivo</div>
            </div>
            <motion.button className="icon-btn" whileHover={{ rotate: -180 }} transition={{ duration: 0.5 }} onClick={() => setRun((r) => r + 1)} aria-label="Reiniciar">
              <RotateCcw size={16} />
            </motion.button>
          </div>
          <div className="phone">
            <div className="phone-screen">
              <div className="wa-head">
                <div className="avatar" style={{ width: 36, height: 36, borderRadius: '50%', fontSize: 12 }}><Bot size={18} /></div>
                <div>
                  <b>{company.client}</b>
                  <AnimatePresence mode="wait">
                    <motion.span key={typing ? 't' : 'o'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'block' }}>
                      {typing ? 'digitando…' : online ? 'online' : 'visto por último hoje'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
              <div className="wa-body" ref={bodyRef}>
                <AnimatePresence initial={false}>
                  {msgs.map((m) => (
                    <motion.div
                      key={m.id}
                      layout
                      className={`bubble ${m.from}`}
                      initial={{ opacity: 0, scale: 0.6, x: m.from === 'in' ? -30 : 30, originX: m.from === 'in' ? 0 : 1 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={spring}
                    >
                      {m.text}
                      <small>{m.time}{m.from === 'out' ? ' ✓✓' : ''}</small>
                    </motion.div>
                  ))}
                  {typing && (
                    <motion.div key="typing" className="bubble out typing" layout initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                      {[0, 1, 2].map((i) => (
                        <motion.i key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="wa-input">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Digite: cardápio, horário…" />
                <motion.button className="wa-send" whileTap={{ scale: 0.8, rotate: 20 }} onClick={send} aria-label="Enviar"><Send size={17} /></motion.button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Page>
  )
}
