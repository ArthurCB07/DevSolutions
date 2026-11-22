import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Server, Database, Mail, HardDrive, Bot, Cpu, CheckCircle2, AlertTriangle, XCircle, Info, RefreshCw } from 'lucide-react'
import { Page, PageHead, Card, Item, IconBox, AreaChart, Progress, Button, useToast, spring } from '../components/ui.jsx'
import { services, incidents } from '../data.js'

const svcIcons = [Server, Cpu, Bot, Database, Mail, HardDrive]
const levelIcon = { warn: [AlertTriangle, 'var(--warn)'], info: [Info, 'var(--accent)'], bad: [XCircle, 'var(--danger)'] }

function seeded(n, seed) {
  let s = seed
  return Array.from({ length: n }, () => { s = (s * 9301 + 49297) % 233280; return s / 233280 })
}

export default function Status() {
  const toast = useToast()
  const [lat, setLat] = useState(services.map((s) => s.latency))
  const [series, setSeries] = useState(() => seeded(24, 7).map((r) => Math.round(80 + r * 60)))
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setLat((l) => l.map((v, i) => Math.max(5, Math.round(services[i].latency + (Math.random() - 0.5) * services[i].latency * 0.3))))
      setSeries((s) => [...s.slice(1), Math.round(80 + Math.random() * 60)])
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const uptimeBars = useMemo(() => services.map((_, si) => seeded(60, si + 3).map((r) => (r > 0.99 ? 'bad' : r > 0.96 ? 'warn' : 'ok'))), [])
  const allOk = services.every((s) => s.status === 'ok')

  const recheck = () => {
    setChecking(true)
    setTimeout(() => { setChecking(false); toast('Verificação concluída: todos os serviços respondendo') }, 1600)
  }

  return (
    <Page>
      <PageHead eyebrow={<><Activity size={14} /> Status do sistema</>} title="Seu sistema está no ar?" subtitle="Monitoramento em tempo real a cada 30 segundos, 24 horas por dia.">
        <Button onClick={recheck}>
          <motion.span animate={checking ? { rotate: 360 } : { rotate: 0 }} transition={checking ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}} style={{ display: 'grid' }}>
            <RefreshCw size={16} />
          </motion.span>
          {checking ? 'Verificando…' : 'Verificar agora'}
        </Button>
      </PageHead>

      <Item>
        <div className="hero" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          <motion.div
            style={{ width: 72, height: 72, borderRadius: 22, display: 'grid', placeItems: 'center', background: allOk ? 'var(--success)' : 'var(--warn)', color: 'white', position: 'relative' }}
            animate={{ boxShadow: ['0 0 0 0 rgba(34,197,94,0.5)', '0 0 0 22px rgba(34,197,94,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {allOk ? <CheckCircle2 size={34} /> : <AlertTriangle size={34} />}
          </motion.div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2>{allOk ? 'Tudo funcionando normalmente' : 'Sistema no ar, com 1 ponto de atenção'}</h2>
            <p style={{ margin: '6px 0 0' }}>99,98% de disponibilidade nos últimos 90 dias · última verificação há poucos segundos</p>
          </div>
        </div>
      </Item>

      <div className="grid g-main">
        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Serviços</div>
              <div className="card-sub">Tempo de resposta ao vivo · histórico de 60 dias</div>
            </div>
          </div>
          <div className="list">
            {services.map((s, i) => {
              const Icon = svcIcons[i]
              const color = s.status === 'ok' ? 'var(--success)' : 'var(--warn)'
              return (
                <div key={s.name} className="list-row" style={{ flexWrap: 'wrap' }}>
                  <IconBox icon={Icon} color={s.status === 'ok' ? '#2563eb' : '#f59e0b'} size={38} iconSize={18} className="row-icon" />
                  <div className="row-main" style={{ minWidth: 180 }}>
                    <b>{s.name}</b>
                    <span>{s.region}</span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={lat[i]}
                      className="mono"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      style={{ color: 'var(--muted)', width: 64, textAlign: 'right' }}
                    >
                      {lat[i]} ms
                    </motion.span>
                  </AnimatePresence>
                  <span className={`pill ${s.status === 'ok' ? 'ok' : 'warn'}`} style={{ minWidth: 104, justifyContent: 'center' }}>
                    <span className="status-dot" style={{ background: color }} />
                    {s.status === 'ok' ? 'Operando' : 'Lentidão'}
                  </span>
                  <div className="uptime" style={{ flexBasis: '100%', marginTop: 10, height: 22 }}>
                    {uptimeBars[i].map((b, j) => (
                      <motion.i
                        key={j}
                        title={b === 'ok' ? 'Sem incidentes' : 'Instabilidade'}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        whileHover={{ scaleY: 1.4 }}
                        transition={{ delay: 0.3 + j * 0.008 + i * 0.05, ...spring }}
                        style={{ background: b === 'ok' ? 'var(--success)' : b === 'warn' ? 'var(--warn)' : 'var(--danger)', opacity: b === 'ok' ? 0.75 : 1 }}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card>
            <div className="card-head">
              <div>
                <div className="card-title">Tempo de resposta</div>
                <div className="card-sub">Média do sistema · ao vivo</div>
              </div>
              <span className="pill info"><span className="status-dot" style={{ background: 'var(--accent)' }} /> Live</span>
            </div>
            <AreaChart data={series} height={150} id="lat" color="#0ea5e9" />
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 16 }}>Recursos do servidor</div>
            {[
              { l: 'CPU', v: 34 }, { l: 'Memória', v: 61 }, { l: 'Disco', v: 48 }, { l: 'Banda (mês)', v: 22 },
            ].map((r, i) => (
              <div key={r.l} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--muted)' }}>{r.l}</span><b>{r.v}%</b>
                </div>
                <Progress value={r.v} delay={0.3 + i * 0.1} />
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Card className="mt">
        <div className="card-title" style={{ marginBottom: 18 }}>Histórico de incidentes</div>
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <motion.div
            style={{ position: 'absolute', left: 8, top: 6, bottom: 6, width: 2, background: 'var(--border-strong)', transformOrigin: 'top' }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1, delay: 0.4 }}
          />
          {incidents.map((inc, i) => {
            const [Icon, color] = levelIcon[inc.level]
            return (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }} style={{ position: 'relative', paddingBottom: 22 }}>
                <span style={{ position: 'absolute', left: -28, top: 0, width: 18, height: 18, borderRadius: '50%', background: 'var(--panel-solid)', display: 'grid', placeItems: 'center', color }}>
                  <Icon size={16} />
                </span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 14.5 }}>{inc.title}</b>
                  <span style={{ fontSize: 12.5, color: 'var(--faint)' }}>{inc.when}</span>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.55 }}>{inc.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </Page>
  )
}
