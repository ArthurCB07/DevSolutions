/*
 * API SIMULADA — roda 100% no navegador (localStorage).
 *
 * Todas as funções são assíncronas e têm a mesma "forma" que as chamadas reais
 * terão. Quando o backend existir (Supabase, Node, etc.), basta reescrever o
 * corpo de cada função para chamar a API — as telas não precisam mudar.
 *
 * ATENÇÃO: aqui as senhas ficam em texto puro no navegador, só para demonstração.
 * No backend real elas devem ser guardadas com hash (bcrypt/argon2) no servidor.
 */
import { contents as seedContents } from '../data.js'

const KEY = 'ds-db-v1'
const SESSION = 'ds-session-v1'
const wait = (ms = 450) => new Promise((r) => setTimeout(r, ms + Math.random() * 250))
const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`
const today = () => new Date().toISOString().slice(0, 10)

export const PLANS = {
  Essencial: { price: 197, modules: ['sistema', 'dominio'] },
  Pro: { price: 397, modules: ['sistema', 'dominio', 'bot'] },
  Premium: { price: 697, modules: ['sistema', 'dominio', 'bot', 'crm'] },
}

export const MODULES = {
  bot: 'Bot de WhatsApp',
  sistema: 'Sistema / Status',
  dominio: 'Domínio & SSL',
  crm: 'CRM de clientes',
}

function modulesFor(plan) {
  return Object.fromEntries(Object.keys(MODULES).map((m) => [m, PLANS[plan].modules.includes(m)]))
}

function seed() {
  const tenants = [
    { id: 't_bomgrao', company: 'Padaria Bom Grão', owner: 'Tiago Moreira', phone: '(11) 98888-1234', plan: 'Premium', status: 'ativo', domain: 'bomgrao.com.br', health: 'ok', botMessages: 18452, createdAt: '2025-03-14', modules: modulesFor('Premium') },
    { id: 't_saojorge', company: 'Mercado São Jorge', owner: 'Ana Lima', phone: '(11) 97777-2211', plan: 'Pro', status: 'ativo', domain: 'mercadosaojorge.com.br', health: 'ok', botMessages: 9310, createdAt: '2025-08-02', modules: modulesFor('Pro') },
    { id: 't_aroma', company: 'Café Aroma', owner: 'Bruno Reis', phone: '(21) 99666-4433', plan: 'Essencial', status: 'ativo', domain: 'cafearoma.com.br', health: 'warn', botMessages: 0, createdAt: '2026-01-20', modules: modulesFor('Essencial') },
    { id: 't_forca', company: 'Academia Força', owner: 'Fábio Costa', phone: '(31) 98555-1200', plan: 'Pro', status: 'teste', domain: 'academiaforca.com.br', health: 'ok', botMessages: 1204, createdAt: '2026-11-10', modules: modulesFor('Pro') },
    { id: 't_visao', company: 'Ótica Visão', owner: 'Hugo Prado', phone: '(41) 99111-0099', plan: 'Essencial', status: 'suspenso', domain: 'oticavisao.com.br', health: 'down', botMessages: 0, createdAt: '2025-05-30', modules: modulesFor('Essencial') },
  ]
  const users = [
    { id: 'u_admin', name: 'Equipe DevSolutions', email: 'admin@devsolutions.com.br', password: 'admin123', role: 'admin', tenantId: null, lastLogin: null },
    { id: 'u_tiago', name: 'Tiago Moreira', email: 'tiago@bomgrao.com.br', password: '123456', role: 'client', tenantId: 't_bomgrao', lastLogin: '2026-11-21' },
    { id: 'u_maria', name: 'Maria Souza', email: 'maria@bomgrao.com.br', password: '123456', role: 'client', tenantId: 't_bomgrao', lastLogin: '2026-11-18' },
    { id: 'u_ana', name: 'Ana Lima', email: 'ana@mercadosaojorge.com.br', password: '123456', role: 'client', tenantId: 't_saojorge', lastLogin: '2026-11-20' },
    { id: 'u_bruno', name: 'Bruno Reis', email: 'bruno@cafearoma.com.br', password: '123456', role: 'client', tenantId: 't_aroma', lastLogin: '2026-11-02' },
    { id: 'u_fabio', name: 'Fábio Costa', email: 'fabio@academiaforca.com.br', password: '123456', role: 'client', tenantId: 't_forca', lastLogin: null },
    { id: 'u_hugo', name: 'Hugo Prado', email: 'hugo@oticavisao.com.br', password: '123456', role: 'client', tenantId: 't_visao', lastLogin: '2026-09-11' },
  ]
  const contents = seedContents.map((c) => ({ ...c, published: true }))
  const audit = [
    { id: uid('a'), at: '2026-11-21 09:12', who: 'Tiago Moreira', what: 'entrou no painel', tenantId: 't_bomgrao' },
    { id: uid('a'), at: '2026-11-20 16:40', who: 'Equipe DevSolutions', what: 'suspendeu Ótica Visão (pagamento pendente)', tenantId: 't_visao' },
    { id: uid('a'), at: '2026-11-10 11:03', who: 'Equipe DevSolutions', what: 'criou o cliente Academia Força (período de teste)', tenantId: 't_forca' },
  ]
  return { tenants, users, contents, audit }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  const db = seed()
  save(db)
  return db
}
function save(db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {}
}
function mutate(fn) {
  const db = load()
  const result = fn(db)
  save(db)
  return result
}
function log(db, who, what, tenantId = null) {
  const at = new Date().toLocaleString('sv-SE').slice(0, 16)
  db.audit.unshift({ id: uid('a'), at, who, what, tenantId })
  db.audit = db.audit.slice(0, 200)
}
const publicUser = ({ password, ...u }) => u
const tempPassword = () => Math.random().toString(36).slice(2, 6) + Math.floor(1000 + Math.random() * 9000)

/* ---------------- Sessão ---------------- */
function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION)) } catch { return null }
}
function writeSession(s) {
  try { s ? localStorage.setItem(SESSION, JSON.stringify(s)) : localStorage.removeItem(SESSION) } catch {}
}

export async function getSession() {
  const s = readSession()
  if (!s) return null
  const db = load()
  const user = db.users.find((u) => u.id === s.userId)
  if (!user) { writeSession(null); return null }
  const tenantId = s.impersonating || user.tenantId
  const tenant = db.tenants.find((t) => t.id === tenantId) || null
  return { user: publicUser(user), tenant, impersonating: !!s.impersonating }
}

export async function login(email, password) {
  await wait(700)
  const db = load()
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user || user.password !== password) throw new Error('E-mail ou senha incorretos.')
  if (user.role === 'client') {
    const t = db.tenants.find((x) => x.id === user.tenantId)
    if (t?.status === 'suspenso') throw new Error('Acesso suspenso. Fale com a DevSolutions para regularizar.')
  }
  mutate((d) => {
    const u = d.users.find((x) => x.id === user.id)
    u.lastLogin = today()
    log(d, u.name, 'entrou no painel', u.tenantId)
  })
  writeSession({ userId: user.id })
  return getSession()
}

export async function logout() {
  await wait(200)
  writeSession(null)
}

export async function requestPasswordReset(email) {
  await wait(800)
  // No backend real: envia um e-mail com link de redefinição. Aqui só confirmamos.
  return { ok: true, email }
}

export async function impersonate(tenantId) {
  await wait(400)
  const s = readSession()
  mutate((d) => {
    const t = d.tenants.find((x) => x.id === tenantId)
    log(d, 'Equipe DevSolutions', `acessou o painel de ${t?.company} como suporte`, tenantId)
  })
  writeSession({ ...s, impersonating: tenantId })
  return getSession()
}

export async function stopImpersonating() {
  await wait(250)
  const s = readSession()
  writeSession({ userId: s.userId })
  return getSession()
}

/* ---------------- Clientes (empresas) ---------------- */
export async function listTenants() {
  await wait(350)
  const db = load()
  return db.tenants.map((t) => ({ ...t, users: db.users.filter((u) => u.tenantId === t.id).length }))
}

export async function getTenant(id) {
  await wait(250)
  const db = load()
  const t = db.tenants.find((x) => x.id === id)
  if (!t) throw new Error('Cliente não encontrado')
  return {
    ...t,
    users: db.users.filter((u) => u.tenantId === id).map(publicUser),
    audit: db.audit.filter((a) => a.tenantId === id).slice(0, 10),
  }
}

export async function createTenant({ company, owner, email, phone, plan, domain, status = 'ativo' }) {
  await wait(700)
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Já existe um usuário com esse e-mail.')
    const tenant = {
      id: uid('t'), company, owner, phone, plan, status, domain, health: 'ok', botMessages: 0,
      createdAt: today(), modules: modulesFor(plan),
    }
    const password = tempPassword()
    db.tenants.unshift(tenant)
    db.users.push({ id: uid('u'), name: owner, email, password, role: 'client', tenantId: tenant.id, lastLogin: null })
    log(db, 'Equipe DevSolutions', `criou o cliente ${company}`, tenant.id)
    return { tenant, credentials: { email, password } }
  })
}

export async function updateTenant(id, patch) {
  await wait(300)
  return mutate((db) => {
    const t = db.tenants.find((x) => x.id === id)
    if (patch.plan && patch.plan !== t.plan && !patch.modules) patch.modules = modulesFor(patch.plan)
    Object.assign(t, patch)
    const what = patch.status ? `alterou status de ${t.company} para "${patch.status}"`
      : patch.plan ? `mudou ${t.company} para o plano ${patch.plan}`
      : patch.modules ? `atualizou módulos de ${t.company}`
      : `editou dados de ${t.company}`
    log(db, 'Equipe DevSolutions', what, id)
    return { ...t }
  })
}

export async function deleteTenant(id) {
  await wait(500)
  mutate((db) => {
    const t = db.tenants.find((x) => x.id === id)
    db.tenants = db.tenants.filter((x) => x.id !== id)
    db.users = db.users.filter((u) => u.tenantId !== id)
    log(db, 'Equipe DevSolutions', `excluiu o cliente ${t?.company}`)
  })
}

/* ---------------- Usuários ---------------- */
export async function addUser(tenantId, { name, email }) {
  await wait(500)
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Já existe um usuário com esse e-mail.')
    const password = tempPassword()
    const user = { id: uid('u'), name, email, password, role: 'client', tenantId, lastLogin: null }
    db.users.push(user)
    log(db, 'Equipe DevSolutions', `criou o acesso de ${name}`, tenantId)
    return { user: publicUser(user), credentials: { email, password } }
  })
}

export async function resetUserPassword(userId) {
  await wait(500)
  return mutate((db) => {
    const u = db.users.find((x) => x.id === userId)
    u.password = tempPassword()
    log(db, 'Equipe DevSolutions', `redefiniu a senha de ${u.name}`, u.tenantId)
    return { email: u.email, password: u.password }
  })
}

export async function removeUser(userId) {
  await wait(400)
  mutate((db) => {
    const u = db.users.find((x) => x.id === userId)
    db.users = db.users.filter((x) => x.id !== userId)
    log(db, 'Equipe DevSolutions', `removeu o acesso de ${u?.name}`, u?.tenantId)
  })
}

export async function changeOwnPassword(userId, current, next) {
  await wait(500)
  return mutate((db) => {
    const u = db.users.find((x) => x.id === userId)
    if (u.password !== current) throw new Error('Senha atual incorreta.')
    u.password = next
    log(db, u.name, 'alterou a própria senha', u.tenantId)
    return true
  })
}

/* ---------------- Conteúdos ---------------- */
export async function listContents({ includeDrafts = false } = {}) {
  await wait(250)
  const db = load()
  return includeDrafts ? db.contents : db.contents.filter((c) => c.published)
}

export async function saveContent(content) {
  await wait(450)
  return mutate((db) => {
    if (content.id && db.contents.some((c) => c.id === content.id)) {
      db.contents = db.contents.map((c) => (c.id === content.id ? { ...c, ...content } : c))
    } else {
      content = { ...content, id: uid('c') }
      db.contents.unshift(content)
    }
    log(db, 'Equipe DevSolutions', `${content.published ? 'publicou' : 'salvou rascunho de'} "${content.title}"`)
    return content
  })
}

export async function deleteContent(id) {
  await wait(350)
  mutate((db) => { db.contents = db.contents.filter((c) => c.id !== id) })
}

/* ---------------- Admin: métricas e auditoria ---------------- */
export async function adminOverview() {
  await wait(400)
  const db = load()
  const paying = db.tenants.filter((t) => t.status === 'ativo')
  return {
    mrr: paying.reduce((s, t) => s + PLANS[t.plan].price, 0),
    active: paying.length,
    trial: db.tenants.filter((t) => t.status === 'teste').length,
    suspended: db.tenants.filter((t) => t.status === 'suspenso').length,
    total: db.tenants.length,
    users: db.users.filter((u) => u.role === 'client').length,
    issues: db.tenants.filter((t) => t.health !== 'ok'),
    byPlan: Object.keys(PLANS).map((p) => ({ plan: p, count: db.tenants.filter((t) => t.plan === p).length })),
    audit: db.audit.slice(0, 8),
  }
}

export async function listAudit() {
  await wait(300)
  const db = load()
  const names = Object.fromEntries(db.tenants.map((t) => [t.id, t.company]))
  return db.audit.map((a) => ({ ...a, tenant: names[a.tenantId] || null }))
}

export function resetDemoData() {
  try { localStorage.removeItem(KEY); localStorage.removeItem(SESSION) } catch {}
}
