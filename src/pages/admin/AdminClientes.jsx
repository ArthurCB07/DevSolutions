import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2, Plus, Search, X, Eye, Ban, PlayCircle, Trash2, KeyRound, UserPlus, Copy, Check, Globe, Phone, Calendar,
  MessageCircle, Loader2, UserX,
} from 'lucide-react'
import { Page, PageHead, Card, Item, Tabs, Toggle, Button, useToast, spring } from '../../components/ui.jsx'
import { Skeleton } from './AdminDashboard.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import * as api from '../../services/api.js'

const statusPill = { ativo: 'ok', teste: 'info', suspenso: 'bad' }
const healthInfo = { ok: ['var(--success)', 'No ar'], warn: ['var(--warn)', 'Lentidão'], down: ['var(--danger)', 'Fora do ar'] }
const avatarColors = ['#2563eb', '#0ea5e9', '#16a34a', '#d97706', '#db2777', '#7c3aed']
const colorFor = (id) => avatarColors[[...id].reduce((s, c) => s + c.charCodeAt(0), 0) % avatarColors.length]
const initialsOf = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

function accessMessage(company, { email, password }) {
  return `Olá! Seu acesso ao painel DevSolutions (${company}) está pronto:\n\nLink: ${window.location.origin}/login\nE-mail: ${email}\nSenha provisória: ${password}\n\nRecomendamos trocar a senha no primeiro acesso, em Configurações.`
}

function CredentialBox({ company, creds, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(accessMessage(company, creds)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <motion.div className="cred-box" initial={{ opacity: 0, scale: 0.95, height: 0 }} animate={{ opacity: 1, scale: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <b style={{ fontSize: 14 }}>Acesso gerado</b>
        {onClose && <button onClick={onClose} style={{ color: 'var(--muted)' }}><X size={16} /></button>}
      </div>
      <div className="mono"><span>{creds.email}</span></div>
      <div className="mono"><span>{creds.password}</span><span style={{ color: 'var(--faint)', fontSize: 11 }}>senha provisória</span></div>
      <Button className="sm primary" onClick={copy}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(copied)} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: 'grid' }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </motion.span>
        </AnimatePresence>
        {copied ? 'Mensagem copiada!' : 'Copiar mensagem para o cliente'}
      </Button>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Esta senha só aparece agora. Envie ao cliente por WhatsApp ou e-mail.</span>
    </motion.div>
  )
}

function PlanPicker({ value, onChange }) {
  return (
    <div className="seg">
      {Object.entries(api.PLANS).map(([name, p]) => (
        <motion.button key={name} type="button" onClick={() => onChange(name)} whileTap={{ scale: 0.96 }} style={{ zIndex: 0 }}>
          {value === name && <motion.span layoutId="plan-ring" className="seg-ring" transition={spring} />}
          <b>{name}</b>
          <span>R$ {p.price}/mês</span>
        </motion.button>
      ))}
    </div>
  )
}

/* ---------------- Modal: novo cliente ---------------- */
function NewTenantModal({ onClose, onCreated }) {
  const toast = useToast()
  const [f, setF] = useState({ company: '', owner: '', email: '', phone: '', domain: '', plan: 'Pro', status: 'ativo' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!f.company || !f.owner || !f.email) return toast('Preencha empresa, responsável e e-mail', 'warn')
    setLoading(true)
    try {
      const r = await api.createTenant(f)
      setResult(r)
      onCreated(r.tenant)
      toast(`${f.company} cadastrado!`)
    } catch (err) { toast(err.message, 'warn') }
    setLoading(false)
  }

  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" style={{ width: 'min(600px, 100%)', padding: 28 }} onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.96 }} transition={spring}>
        <div className="card-head">
          <div>
            <div className="card-title" style={{ fontSize: 19 }}>{result ? 'Cliente criado 🎉' : 'Novo cliente'}</div>
            <div className="card-sub">{result ? 'Envie o acesso abaixo para o responsável.' : 'Cria a empresa e o primeiro acesso de login.'}</div>
          </div>
          <motion.button className="icon-btn" whileHover={{ rotate: 90 }} onClick={onClose}><X size={16} /></motion.button>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="r" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CredentialBox company={result.tenant.company} creds={result.credentials} />
              <Button style={{ width: '100%', marginTop: 14 }} onClick={onClose}>Concluir</Button>
            </motion.div>
          ) : (
            <motion.form key="f" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
              <div className="form-grid">
                {[
                  ['company', 'Empresa', 'Padaria Exemplo', 'full'], ['owner', 'Responsável', 'Nome completo'], ['email', 'E-mail de login', 'contato@empresa.com.br'],
                  ['phone', 'WhatsApp', '(11) 90000-0000'], ['domain', 'Domínio', 'empresa.com.br'],
                ].map(([k, l, ph, cls], i) => (
                  <motion.div key={k} className={cls} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                    <label className="lbl">{l}</label>
                    <input className="input" placeholder={ph} value={f[k]} onChange={set(k)} type={k === 'email' ? 'email' : 'text'} autoFocus={i === 0} />
                  </motion.div>
                ))}
                <div className="full">
                  <label className="lbl">Plano</label>
                  <PlanPicker value={f.plan} onChange={(plan) => setF({ ...f, plan })} />
                </div>
                <div className="full" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Toggle on={f.status === 'teste'} onChange={(v) => setF({ ...f, status: v ? 'teste' : 'ativo' })} />
                  <span style={{ fontSize: 14 }}>Começar em período de teste</span>
                </div>
              </div>
              <motion.button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 20, padding: 13 }} whileTap={{ scale: 0.97 }}>
                {loading ? <Loader2 size={18} className="spin" /> : <><Plus size={16} /> Criar cliente e gerar acesso</>}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ---------------- Drawer: detalhes do cliente ---------------- */
function TenantDrawer({ id, onClose, onChanged, onDeleted }) {
  const toast = useToast()
  const nav = useNavigate()
  const { impersonate } = useAuth()
  const [t, setT] = useState(null)
  const [creds, setCreds] = useState(null)
  const [newUser, setNewUser] = useState(null) // {name,email} form
  const [confirmDel, setConfirmDel] = useState(false)

  const load = () => api.getTenant(id).then(setT)
  useEffect(() => { setT(null); setCreds(null); setConfirmDel(false); load() }, [id])

  const patch = async (p, msg) => {
    const updated = await api.updateTenant(id, p)
    setT((x) => ({ ...x, ...updated }))
    onChanged(updated)
    if (msg) toast(msg, p.status === 'suspenso' ? 'warn' : 'ok')
    load()
  }

  const enter = async () => {
    await impersonate(id)
    nav('/')
  }

  return (
    <>
      <motion.div className="overlay" style={{ zIndex: 105 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 34 }}>
        <div className="drawer-head">
          {t ? (
            <>
              <motion.div className="mini-avatar" style={{ background: colorFor(t.id), width: 46, height: 46, borderRadius: 14, fontSize: 15 }} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={spring}>
                {initialsOf(t.company)}
              </motion.div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 17 }}>{t.company}</b>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span className={`pill ${statusPill[t.status]}`}>{t.status}</span>
                  <span className="pill neutral"><span className="status-dot" style={{ background: healthInfo[t.health][0] }} />{healthInfo[t.health][1]}</span>
                </div>
              </div>
            </>
          ) : <div style={{ flex: 1 }}><Skeleton h={46} w="70%" /></div>}
          <motion.button className="icon-btn" whileHover={{ rotate: 90 }} onClick={onClose}><X size={16} /></motion.button>
        </div>

        {t && (
          <motion.div className="drawer-body" initial="i" animate="a" variants={{ a: { transition: { staggerChildren: 0.06 } } }}>
            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button className="primary sm" onClick={enter} disabled={t.status === 'suspenso'}><Eye size={15} /> Entrar como cliente</Button>
              {t.status === 'suspenso' ? (
                <Button className="sm" onClick={() => patch({ status: 'ativo' }, 'Acesso reativado')}><PlayCircle size={15} /> Reativar</Button>
              ) : (
                <Button className="sm" onClick={() => patch({ status: 'suspenso' }, 'Acesso suspenso — usuários não conseguem mais entrar')}><Ban size={15} /> Suspender</Button>
              )}
              {t.status === 'teste' && <Button className="sm" onClick={() => patch({ status: 'ativo' }, 'Cliente convertido para ativo 🎉')}>Converter em ativo</Button>}
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }}>
              <div className="section-title">Dados</div>
              <div className="list">
                {[[Building2, 'Responsável', t.owner], [Globe, 'Domínio', t.domain], [Phone, 'WhatsApp', t.phone || '—'], [Calendar, 'Cliente desde', t.createdAt.split('-').reverse().join('/')], [MessageCircle, 'Mensagens do bot', t.botMessages.toLocaleString('pt-BR')]].map(([I, k, v]) => (
                  <div key={k} className="list-row" style={{ padding: '10px 0' }}>
                    <I size={16} color="var(--faint)" />
                    <div className="row-main"><span>{k}</span></div>
                    <b style={{ fontSize: 13.5 }}>{v}</b>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }}>
              <div className="section-title">Plano</div>
              <PlanPicker value={t.plan} onChange={(plan) => plan !== t.plan && patch({ plan }, `Plano alterado para ${plan}`)} />
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }}>
              <div className="section-title">Módulos liberados</div>
              <div className="list">
                {Object.entries(api.MODULES).map(([k, label]) => (
                  <div key={k} className="list-row" style={{ padding: '10px 0' }}>
                    <div className="row-main"><b>{label}</b><span>{t.modules[k] ? 'Visível no painel do cliente' : 'Oculto para o cliente'}</span></div>
                    <Toggle on={t.modules[k]} onChange={(v) => patch({ modules: { ...t.modules, [k]: v } }, `${label} ${v ? 'liberado' : 'bloqueado'}`)} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-title">Acessos ({t.users.length})</div>
                <Button className="sm ghost" onClick={() => setNewUser(newUser ? null : { name: '', email: '' })}><UserPlus size={15} /> {newUser ? 'Cancelar' : 'Novo acesso'}</Button>
              </div>
              <AnimatePresence>
                {newUser && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gap: 8, padding: '4px 0 14px' }}>
                      <input className="input" placeholder="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                      <input className="input" placeholder="E-mail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                      <Button className="primary sm" onClick={async () => {
                        if (!newUser.name || !newUser.email) return toast('Preencha nome e e-mail', 'warn')
                        try {
                          const r = await api.addUser(id, newUser)
                          setCreds(r.credentials); setNewUser(null); load(); toast('Acesso criado')
                        } catch (e) { toast(e.message, 'warn') }
                      }}>Criar acesso</Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>{creds && <CredentialBox company={t.company} creds={creds} onClose={() => setCreds(null)} />}</AnimatePresence>
              <div className="list">
                <AnimatePresence initial={false}>
                  {t.users.map((u) => (
                    <motion.div key={u.id} layout className="list-row" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="mini-avatar" style={{ background: colorFor(u.id) }}>{initialsOf(u.name)}</div>
                      <div className="row-main"><b>{u.name}</b><span>{u.email} · {u.lastLogin ? `último acesso ${u.lastLogin.split('-').reverse().join('/')}` : 'nunca acessou'}</span></div>
                      <motion.button className="btn ghost sm" title="Redefinir senha" whileTap={{ scale: 0.85 }} onClick={async () => { const c = await api.resetUserPassword(u.id); setCreds(c); toast('Nova senha provisória gerada', 'info') }}>
                        <KeyRound size={15} />
                      </motion.button>
                      <motion.button className="btn ghost sm danger" title="Remover acesso" whileTap={{ scale: 0.85 }} onClick={async () => { await api.removeUser(u.id); load(); toast('Acesso removido', 'warn') }}>
                        <UserX size={15} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }}>
              <div className="section-title">Atividade</div>
              {t.audit.length === 0 && <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>Sem registros.</span>}
              {t.audit.map((a) => (
                <div key={a.id} style={{ display: 'flex', gap: 10, fontSize: 13, padding: '6px 0', color: 'var(--muted)' }}>
                  <span className="mono" style={{ color: 'var(--faint)', fontSize: 11.5, whiteSpace: 'nowrap' }}>{a.at}</span>
                  <span><b style={{ color: 'var(--text)' }}>{a.who}</b> {a.what}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={{ i: { opacity: 0, y: 14 }, a: { opacity: 1, y: 0 } }} style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
              <AnimatePresence mode="wait">
                {confirmDel ? (
                  <motion.div key="c" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="login-error" style={{ display: 'grid', gap: 10 }}>
                    Excluir {t.company} e todos os acessos? Isso não pode ser desfeito.
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button className="sm" style={{ background: 'var(--danger)', color: 'white', borderColor: 'transparent' }} onClick={async () => { await api.deleteTenant(id); onDeleted(id); toast('Cliente excluído', 'warn') }}>Sim, excluir</Button>
                      <Button className="sm" onClick={() => setConfirmDel(false)}>Cancelar</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button className="sm ghost danger" onClick={() => setConfirmDel(true)}><Trash2 size={15} /> Excluir cliente</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </motion.aside>
    </>
  )
}

/* ---------------- Página ---------------- */
export default function AdminClientes() {
  const [params, setParams] = useSearchParams()
  const [tenants, setTenants] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const openId = params.get('id')
  const creating = params.get('novo') === '1'

  useEffect(() => { api.listTenants().then(setTenants) }, [])

  const list = useMemo(() => (tenants || []).filter((t) =>
    (filter === 'all' || t.status === filter) &&
    (!q || `${t.company} ${t.owner} ${t.domain}`.toLowerCase().includes(q.toLowerCase()))
  ), [tenants, q, filter])

  const count = (s) => (tenants || []).filter((t) => s === 'all' || t.status === s).length
  const tabs = [
    { value: 'all', label: `Todos (${count('all')})` },
    { value: 'ativo', label: `Ativos (${count('ativo')})` },
    { value: 'teste', label: `Em teste (${count('teste')})` },
    { value: 'suspenso', label: `Suspensos (${count('suspenso')})` },
  ]

  const upsert = (t) => setTenants((ts) => {
    const exists = ts.some((x) => x.id === t.id)
    return exists ? ts.map((x) => (x.id === t.id ? { ...x, ...t } : x)) : [{ ...t, users: 1 }, ...ts]
  })

  return (
    <Page>
      <PageHead eyebrow={<><Building2 size={14} /> Administração</>} title="Clientes" subtitle="Crie acessos, libere módulos, mude planos e entre no painel de qualquer cliente.">
        <div className="search" style={{ minWidth: 240, cursor: 'text' }}>
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar empresa, responsável…" style={{ background: 'none', border: 'none', outline: 'none', flex: 1 }} />
        </div>
        <Button className="primary" onClick={() => setParams({ novo: '1' })}><Plus size={16} /> Novo cliente</Button>
      </PageHead>

      <Item style={{ marginBottom: 18 }}><Tabs id="tstatus" tabs={tabs} value={filter} onChange={setFilter} /></Item>

      <Card style={{ padding: 10 }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Empresa</th><th>Plano</th><th>Status</th><th>Sistema</th><th>Acessos</th><th>Desde</th></tr></thead>
            <tbody>
              {!tenants && [0, 1, 2, 3].map((i) => <tr key={i}><td colSpan={6}><Skeleton h={36} /></td></tr>)}
              <AnimatePresence initial={false}>
                {list.map((t, i) => (
                  <motion.tr
                    key={t.id} layout className="t-row" onClick={() => setParams({ id: t.id })}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} exit={{ opacity: 0, x: -30 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <motion.div className="mini-avatar" style={{ background: colorFor(t.id) }} whileHover={{ rotate: -10, scale: 1.1 }}>{initialsOf(t.company)}</motion.div>
                        <div>
                          <b style={{ display: 'block', fontSize: 14 }}>{t.company}</b>
                          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t.owner} · {t.domain}</span>
                        </div>
                      </div>
                    </td>
                    <td><b style={{ fontSize: 13.5 }}>{t.plan}</b><div style={{ fontSize: 12, color: 'var(--faint)' }}>R$ {api.PLANS[t.plan].price}/mês</div></td>
                    <td><motion.span key={t.status} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={spring} className={`pill ${statusPill[t.status]}`}>{t.status}</motion.span></td>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}><span className="status-dot" style={{ background: healthInfo[t.health][0] }} />{healthInfo[t.health][1]}</span></td>
                    <td style={{ fontSize: 13.5 }}>{t.users}</td>
                    <td className="mono" style={{ color: 'var(--faint)' }}>{t.createdAt.split('-').reverse().join('/')}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {tenants && list.length === 0 && <div className="empty">Nenhum cliente encontrado.</div>}
        </div>
      </Card>

      <AnimatePresence>
        {openId && (
          <TenantDrawer
            key="drawer" id={openId} onClose={() => setParams({})}
            onChanged={upsert}
            onDeleted={(id) => { setTenants((ts) => ts.filter((x) => x.id !== id)); setParams({}) }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {creating && <NewTenantModal key="new" onClose={() => setParams({})} onCreated={upsert} />}
      </AnimatePresence>
    </Page>
  )
}
