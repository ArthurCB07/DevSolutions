import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Globe, ShieldCheck, Calendar, RefreshCw, Copy, Check, Lock, Plus, Trash2, Link2 } from 'lucide-react'
import { Page, PageHead, Card, IconBox, Ring, Toggle, Button, Progress, useToast, spring } from '../components/ui.jsx'
import { domain as demoDomain } from '../data.js'
import { useTenant } from '../auth/AuthContext.jsx'

const typeColor = { A: '#2563eb', CNAME: '#0ea5e9', MX: '#f59e0b', TXT: '#22c55e' }

export default function Dominio() {
  const toast = useToast()
  const t = useTenant()
  const name = t.domain || demoDomain.name
  const domain = {
    ...demoDomain,
    name,
    dns: demoDomain.dns.map((r) => ({ ...r, value: r.value.replace('bomgrao.com.br', name) })),
    subdomains: demoDomain.subdomains.map((s) => ({ ...s, name: s.name.replace('bomgrao.com.br', name) })),
  }
  const [autoRenew, setAutoRenew] = useState(domain.autoRenew)
  const [records, setRecords] = useState(domain.dns.map((r, i) => ({ ...r, id: i })))
  const [copied, setCopied] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ type: 'A', name: '', value: '' })

  const copy = (id, text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 1400)
  }

  const add = () => {
    if (!form.name || !form.value) return toast('Preencha nome e valor', 'warn')
    setRecords((r) => [{ ...form, ttl: '3600', id: Date.now() }, ...r])
    setForm({ type: 'A', name: '', value: '' })
    setAdding(false)
    toast('Registro DNS adicionado — propagação em até 1 h', 'info')
  }

  const pct = Math.round((domain.daysLeft / domain.totalDays) * 100)

  return (
    <Page>
      <PageHead eyebrow={<><Globe size={14} /> Domínio & SSL</>} title={domain.name} subtitle="Endereço, certificado de segurança e configurações de DNS do seu sistema.">
        <Button onClick={() => window.open(`https://${domain.name}`, '_blank')}><Link2 size={16} /> Abrir site</Button>
        <Button className="primary" onClick={() => toast('Renovação solicitada à equipe DevSolutions', 'info')}><RefreshCw size={16} /> Renovar agora</Button>
      </PageHead>

      <div className="grid g-3">
        <Card tilt>
          <div className="card-head"><div className="card-title"><Calendar size={17} /> Vencimento do domínio</div></div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '4px 0 14px' }}>
            <Ring value={pct} label={`${domain.daysLeft}`} sub="dias restantes" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--muted)' }}>
            <span>Expira em</span><b style={{ color: 'var(--text)' }}>{domain.expires}</b>
          </div>
          <div className="list-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="row-main"><b>Renovação automática</b><span>{autoRenew ? 'Ativada · sem risco de perder o domínio' : 'Desativada'}</span></div>
            <Toggle on={autoRenew} onChange={(v) => { setAutoRenew(v); toast(v ? 'Renovação automática ativada' : 'Renovação automática desativada', v ? 'ok' : 'warn') }} />
          </div>
        </Card>

        <Card tilt>
          <div className="card-head">
            <div className="card-title"><ShieldCheck size={17} /> Certificado SSL</div>
            <span className="pill ok">Válido</span>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0 18px' }}>
            <motion.div
              style={{ width: 96, height: 96, borderRadius: 28, display: 'grid', placeItems: 'center', background: 'var(--success-soft)', color: 'var(--success)' }}
              animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
            >
              <Lock size={42} />
            </motion.div>
          </div>
          <div className="list">
            <div className="list-row"><div className="row-main"><span>Emissor</span></div><b style={{ fontSize: 14 }}>{domain.ssl.issuer}</b></div>
            <div className="list-row"><div className="row-main"><span>Válido até</span></div><b style={{ fontSize: 14 }}>{domain.ssl.expires}</b></div>
            <div className="list-row"><div className="row-main"><span>Renovação</span></div><span className="pill info">Automática</span></div>
          </div>
        </Card>

        <Card tilt>
          <div className="card-head"><div className="card-title"><Globe size={17} /> Informações</div></div>
          <div className="list">
            {[
              ['Registrador', domain.registrar], ['Registrado em', domain.registered], ['Nameservers', 'ns1.devsolutions.com.br'], ['Proteção WHOIS', 'Ativa'],
            ].map(([k, v]) => (
              <div key={k} className="list-row"><div className="row-main"><span>{k}</span></div><b style={{ fontSize: 13.5 }}>{v}</b></div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--muted)' }}><span>Propagação DNS</span><b style={{ color: 'var(--text)' }}>100%</b></div>
            <Progress value={100} color="var(--success)" />
          </div>
        </Card>
      </div>

      <div className="grid g-main mt">
        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Registros DNS</div>
              <div className="card-sub">Alterações são aplicadas em até 1 hora</div>
            </div>
            <Button className="sm" onClick={() => setAdding((a) => !a)}>
              <motion.span animate={{ rotate: adding ? 45 : 0 }} transition={spring} style={{ display: 'grid' }}><Plus size={15} /></motion.span>
              {adding ? 'Cancelar' : 'Adicionar'}
            </Button>
          </div>

          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 2fr auto', gap: 10, paddingBottom: 18 }}>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {Object.keys(typeColor).map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input className="input" placeholder="Nome (ex: www)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className="input" placeholder="Valor" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  <Button className="primary" onClick={add}>Salvar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Tipo</th><th>Nome</th><th>Valor</th><th>TTL</th><th></th></tr></thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {records.map((r) => (
                    <motion.tr
                      key={r.id} layout
                      initial={{ opacity: 0, x: -20, backgroundColor: 'rgba(37,99,235,0.18)' }}
                      animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(37,99,235,0)' }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.5 }}
                    >
                      <td><span className="pill" style={{ color: typeColor[r.type], background: `color-mix(in srgb, ${typeColor[r.type]} 15%, transparent)` }}>{r.type}</span></td>
                      <td className="mono">{r.name}</td>
                      <td className="mono" style={{ color: 'var(--muted)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value}</td>
                      <td className="mono" style={{ color: 'var(--faint)' }}>{r.ttl}</td>
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <motion.button className="btn ghost sm" whileTap={{ scale: 0.85 }} onClick={() => copy(r.id, r.value)} aria-label="Copiar">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span key={copied === r.id ? 'c' : 'n'} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'grid' }}>
                              {copied === r.id ? <Check size={15} color="var(--success)" /> : <Copy size={15} />}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                        <motion.button className="btn ghost sm danger" whileTap={{ scale: 0.85 }} whileHover={{ rotate: -10 }}
                          onClick={() => { setRecords((rs) => rs.filter((x) => x.id !== r.id)); toast('Registro removido', 'warn') }} aria-label="Remover">
                          <Trash2 size={15} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="card-title" style={{ marginBottom: 14 }}>Subdomínios</div>
          <div className="list">
            {domain.subdomains.map((s, i) => (
              <motion.div key={s.name} className="list-row" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} whileHover={{ x: 4 }}>
                <IconBox icon={Globe} color={s.status === 'ok' ? '#22c55e' : '#f59e0b'} size={36} iconSize={16} className="row-icon" />
                <div className="row-main"><b className="mono">{s.name}</b><span>{s.status === 'ok' ? 'Respondendo · HTTPS' : 'Aguardando configuração'}</span></div>
                <span className="status-dot" style={{ background: s.status === 'ok' ? 'var(--success)' : 'var(--warn)' }} />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  )
}
