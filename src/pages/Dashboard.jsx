import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MessageCircle, Users, Activity, Wallet, ArrowUpRight, ArrowDownRight, Bot, Rocket, UserPlus, ShieldCheck,
  Globe, ChevronRight, Sparkles, BookOpen,
} from 'lucide-react'
import { Page, PageHead, Card, Counter, IconBox, AreaChart, Sparkline, Button, Ring, Item, spring } from '../components/ui.jsx'
import { kpis, revenue, activity, services, domain, contents } from '../data.js'
import { useTenant } from '../auth/AuthContext.jsx'

const kpiStyle = {
  msgs: { icon: MessageCircle, color: '#16a34a' },
  leads: { icon: Users, color: '#2563eb' },
  uptime: { icon: Activity, color: '#0ea5e9' },
  revenue: { icon: Wallet, color: '#f59e0b' },
}
const actIcon = {
  bot: [Bot, '#16a34a'], deploy: [Rocket, '#2563eb'], lead: [UserPlus, '#0ea5e9'], ssl: [ShieldCheck, '#22c55e'],
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function Dashboard() {
  const nav = useNavigate()
  const t = useTenant()
  const allOk = services.filter((s) => s.status === 'ok').length

  return (
    <Page>
      <PageHead
        eyebrow={<><Sparkles size={14} /> Visão geral</>}
        title={<>{greeting()}, <span className="grad-text">{t.firstName}</span> 👋</>}
        subtitle={`Tudo sobre ${t.client} em um só lugar: sistema, bot e domínio.`}
      >
        {t.modules.sistema && <Button onClick={() => nav('/status')}><Activity size={16} /> Ver status</Button>}
        {t.modules.bot && <Button className="primary" onClick={() => nav('/whatsapp')}><Bot size={16} /> Configurar bot</Button>}
      </PageHead>

      <div className="grid g-4">
        {kpis.filter((k) => t.modules.bot || !['msgs', 'revenue'].includes(k.id)).map((k) => {
          const s = kpiStyle[k.id]
          const up = k.trend >= 0
          return (
            <Card key={k.id} tilt whileHover={{ y: -6 }} transition={spring}>
              <div className="kpi-top">
                <IconBox icon={s.icon} color={s.color} />
                <span className={`trend ${up ? 'up' : 'down'}`}>
                  {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(k.trend).toLocaleString('pt-BR')}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div className="kpi-value"><Counter value={k.value} prefix={k.prefix} suffix={k.suffix} decimals={k.decimals} /></div>
                  <div className="kpi-label">{k.label}</div>
                </div>
                <Sparkline data={k.spark} color={s.color} width={80} />
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid g-main mt">
        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">{t.modules.bot ? 'Vendas pelo bot' : 'Acessos ao seu sistema'}</div>
              <div className="card-sub">{t.modules.bot ? 'Faturamento gerado por pedidos no WhatsApp em 2026' : 'Visitas mensais ao seu site e sistema em 2026'}</div>
            </div>
            <span className="trend up"><ArrowUpRight size={14} /> 165% no ano</span>
          </div>
          <AreaChart data={revenue.data} labels={revenue.labels} id="rev" />
        </Card>

        <Card>
          <div className="card-head">
            <div>
              <div className="card-title">Saúde do sistema</div>
              <div className="card-sub">Atualizado agora</div>
            </div>
            <span className="pill ok"><span className="status-dot" style={{ background: 'var(--success)' }} /> No ar</span>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', padding: '6px 0 16px' }}>
            <Ring value={(allOk / services.length) * 100} label={`${allOk}/${services.length}`} sub="serviços operando" />
          </div>
          <div className="list">
            {[
              { icon: MessageCircle, color: '#16a34a', t: 'Bot de WhatsApp', s: 'Conectado · 164 ms', to: '/whatsapp', m: 'bot' },
              { icon: Globe, color: '#0ea5e9', t: t.domain, s: `Expira em ${domain.daysLeft} dias`, to: '/dominio', m: 'dominio' },
              { icon: ShieldCheck, color: '#22c55e', t: 'Certificado SSL', s: `Válido por ${domain.ssl.daysLeft} dias`, to: '/dominio', m: 'dominio' },
            ].filter((r) => t.modules[r.m]).map((r) => (
              <motion.button key={r.t} className="list-row" style={{ width: '100%', textAlign: 'left' }} whileHover={{ x: 6 }} transition={spring} onClick={() => nav(r.to)}>
                <IconBox icon={r.icon} color={r.color} size={38} iconSize={18} className="row-icon" />
                <div className="row-main"><b>{r.t}</b><span>{r.s}</span></div>
                <ChevronRight size={16} color="var(--faint)" />
              </motion.button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid g-2 mt">
        <Card>
          <div className="card-head">
            <div className="card-title">Atividade recente</div>
          </div>
          <div className="list">
            {activity.map((a, i) => {
              const [Icon, color] = actIcon[a.type]
              return (
                <motion.div
                  key={i} className="list-row"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                >
                  <IconBox icon={Icon} color={color} size={38} iconSize={18} className="row-icon" />
                  <div className="row-main"><b>{a.title}</b><span>{a.meta}</span></div>
                </motion.div>
              )
            })}
          </div>
        </Card>

        <Item>
          <div className="hero" style={{ height: '100%' }}>
            <motion.div
              style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.18 }}
              animate={{ rotate: [0, 8, -4, 0], y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookOpen size={220} />
            </motion.div>
            <div className="eyebrow"><BookOpen size={14} /> Conteúdo da semana</div>
            <h2>{contents[0].title}</h2>
            <p>{contents[0].excerpt}</p>
            <Button className="primary" onClick={() => nav(`/conteudos?c=${contents[0].id}`)}>Ler agora <ArrowUpRight size={16} /></Button>
          </div>
        </Item>
      </div>
    </Page>
  )
}
