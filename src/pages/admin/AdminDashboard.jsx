import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wallet, Building2, FlaskConical, Ban, Plus, AlertTriangle, XCircle, ChevronRight, ScrollText, Users, LayoutDashboard } from 'lucide-react'
import { Page, PageHead, Card, Counter, IconBox, Button, Progress, spring } from '../../components/ui.jsx'
import { adminOverview, PLANS } from '../../services/api.js'

export function Skeleton({ h = 18, w = '100%', r = 8, style }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
      style={{ height: h, width: w, borderRadius: r, background: 'var(--panel-hover)', ...style }}
    />
  )
}

export default function AdminDashboard() {
  const nav = useNavigate()
  const [data, setData] = useState(null)
  useEffect(() => { adminOverview().then(setData) }, [])

  const kpis = data && [
    { icon: Wallet, color: '#2563eb', label: 'Receita mensal recorrente', node: <Counter value={data.mrr} prefix="R$ " /> },
    { icon: Building2, color: '#16a34a', label: 'Clientes ativos', node: <Counter value={data.active} /> },
    { icon: FlaskConical, color: '#0ea5e9', label: 'Em período de teste', node: <Counter value={data.trial} /> },
    { icon: Ban, color: '#dc2626', label: 'Suspensos', node: <Counter value={data.suspended} /> },
  ]

  return (
    <Page>
      <PageHead eyebrow={<><LayoutDashboard size={14} /> Administração</>} title="Visão geral da DevSolutions" subtitle="Seus clientes, receita e o que precisa de atenção hoje.">
        <Button onClick={() => nav('/admin/auditoria')}><ScrollText size={16} /> Atividades</Button>
        <Button className="primary" onClick={() => nav('/admin/clientes?novo=1')}><Plus size={16} /> Novo cliente</Button>
      </PageHead>

      <div className="grid g-4">
        {(kpis || Array.from({ length: 4 })).map((k, i) => (
          <Card key={i} tilt whileHover={{ y: -6 }}>
            {k ? (
              <>
                <IconBox icon={k.icon} color={k.color} />
                <div className="kpi-value">{k.node}</div>
                <div className="kpi-label">{k.label}</div>
              </>
            ) : (
              <><Skeleton h={44} w={44} r={13} /><Skeleton h={30} w="60%" style={{ marginTop: 18 }} /><Skeleton h={14} w="80%" style={{ marginTop: 8 }} /></>
            )}
          </Card>
        ))}
      </div>

      <div className="grid g-main mt">
        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Precisam de atenção</div>
              <div className="card-sub">Sistemas com lentidão ou fora do ar</div>
            </div>
            {data && <span className={`pill ${data.issues.length ? 'warn' : 'ok'}`}>{data.issues.length} alerta(s)</span>}
          </div>
          <div className="list">
            {!data && [0, 1].map((i) => <Skeleton key={i} h={50} style={{ margin: '8px 0' }} />)}
            {data?.issues.length === 0 && <div className="empty">Tudo funcionando em todos os clientes 🎉</div>}
            {data?.issues.map((t, i) => (
              <motion.button
                key={t.id} className="list-row" style={{ width: '100%', textAlign: 'left' }}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                whileHover={{ x: 6 }} onClick={() => nav(`/admin/clientes?id=${t.id}`)}
              >
                <IconBox icon={t.health === 'down' ? XCircle : AlertTriangle} color={t.health === 'down' ? '#dc2626' : '#d97706'} size={38} iconSize={18} className="row-icon" />
                <div className="row-main">
                  <b>{t.company}</b>
                  <span>{t.domain} · {t.health === 'down' ? 'Fora do ar' : 'Lentidão detectada'}</span>
                </div>
                <span className={`pill ${t.status === 'suspenso' ? 'bad' : 'neutral'}`}>{t.status}</span>
                <ChevronRight size={16} color="var(--faint)" />
              </motion.button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title" style={{ marginBottom: 18 }}>Clientes por plano</div>
          {data ? data.byPlan.map((p, i) => (
            <div key={p.plan} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
                <span><b>{p.plan}</b> <span style={{ color: 'var(--faint)' }}>· R$ {PLANS[p.plan].price}/mês</span></span>
                <b>{p.count}</b>
              </div>
              <Progress value={data.total ? (p.count / data.total) * 100 : 0} delay={0.2 + i * 0.1} />
            </div>
          )) : [0, 1, 2].map((i) => <Skeleton key={i} h={28} style={{ marginBottom: 16 }} />)}
          {data && (
            <div className="list-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <IconBox icon={Users} color="#2563eb" size={38} iconSize={18} className="row-icon" />
              <div className="row-main"><b>{data.users} acessos de clientes</b><span>em {data.total} empresas</span></div>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt">
        <div className="card-head">
          <div className="card-title">Atividade recente</div>
          <Button className="sm ghost" onClick={() => nav('/admin/auditoria')}>Ver tudo <ChevronRight size={14} /></Button>
        </div>
        <div className="list">
          {data?.audit.map((a, i) => (
            <motion.div key={a.id} className="list-row" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, ...spring }}>
              <span className="status-dot" style={{ background: a.who.includes('DevSolutions') ? 'var(--accent)' : 'var(--success)' }} />
              <div className="row-main"><b style={{ whiteSpace: 'normal' }}><span style={{ fontWeight: 700 }}>{a.who}</span> <span style={{ fontWeight: 500, color: 'var(--muted)' }}>{a.what}</span></b></div>
              <span className="mono" style={{ color: 'var(--faint)', fontSize: 12 }}>{a.at}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </Page>
  )
}
