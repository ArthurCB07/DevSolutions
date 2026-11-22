import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Moon, Sun, Mail, MessageCircle, Shield, User, KeyRound, Package, Check, Lock } from 'lucide-react'
import { Page, PageHead, Card, IconBox, Toggle, Button, useToast, spring } from '../components/ui.jsx'
import { useAuth, useTenant } from '../auth/AuthContext.jsx'
import { changeOwnPassword, MODULES } from '../services/api.js'

export default function Configuracoes({ theme, setTheme }) {
  const toast = useToast()
  const { user, impersonating } = useAuth()
  const t = useTenant()
  const [prefs, setPrefs] = useState({ email: true, whats: true, weekly: false, twofa: true })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const set = (k) => (v) => setPrefs((p) => ({ ...p, [k]: v }))

  const savePw = async () => {
    if (pw.next.length < 6) return toast('A nova senha precisa de pelo menos 6 caracteres', 'warn')
    if (pw.next !== pw.confirm) return toast('As senhas não conferem', 'warn')
    setSaving(true)
    try {
      await changeOwnPassword(user.id, pw.current, pw.next)
      setPw({ current: '', next: '', confirm: '' })
      toast('Senha alterada com sucesso')
    } catch (e) { toast(e.message, 'warn') }
    setSaving(false)
  }

  return (
    <Page>
      <PageHead eyebrow={<><Settings size={14} /> Configurações</>} title="Sua conta" subtitle="Perfil, segurança, plano e preferências." />

      <div className="grid g-2">
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          <Card>
            <div className="card-title" style={{ marginBottom: 18 }}><User size={17} /> Perfil</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <motion.div className="avatar" style={{ width: 64, height: 64, borderRadius: 20, fontSize: 22 }} whileHover={{ scale: 1.08, rotate: -6 }} transition={spring}>{t.initials}</motion.div>
              <div>
                <b style={{ fontSize: 16 }}>{impersonating ? t.owner : user?.name}</b>
                <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{impersonating ? 'Visualização do suporte' : user?.email}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t.client}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 16 }}><Package size={17} /> {t.planLabel}</div>
            <div className="list">
              {Object.entries(MODULES).map(([k, label]) => (
                <div key={k} className="list-row">
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
                    style={{ width: 26, height: 26, borderRadius: 8, display: 'grid', placeItems: 'center', background: t.modules[k] ? 'var(--success-soft)' : 'var(--panel-hover)', color: t.modules[k] ? 'var(--success)' : 'var(--faint)' }}
                  >
                    {t.modules[k] ? <Check size={15} /> : <Lock size={13} />}
                  </motion.span>
                  <div className="row-main"><b>{label}</b></div>
                  <span className={`pill ${t.modules[k] ? 'ok' : 'neutral'}`}>{t.modules[k] ? 'Incluso' : 'Não contratado'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="card-title" style={{ marginBottom: 16 }}><KeyRound size={17} /> Alterar senha</div>
            {impersonating ? (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Indisponível no modo suporte. Use “Redefinir senha” no painel admin.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                <input className="input" type="password" placeholder="Senha atual" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                <input className="input" type="password" placeholder="Nova senha" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                <input className="input" type="password" placeholder="Confirmar nova senha" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
                <Button className="primary" onClick={savePw} disabled={saving}>{saving ? 'Salvando…' : 'Salvar nova senha'}</Button>
              </div>
            )}
          </Card>
        </div>

        <Card style={{ alignSelf: 'start' }}>
          <div className="card-title" style={{ marginBottom: 18 }}>Aparência</div>
          <div className="grid g-2" style={{ gap: 12 }}>
            {[
              { v: 'light', l: 'Claro', icon: Sun, bg: '#f7f8fa', fg: '#0f172a' },
              { v: 'dark', l: 'Escuro', icon: Moon, bg: '#0b0f17', fg: '#e6eaf2' },
            ].map((o) => (
              <motion.button
                key={o.v} onClick={() => setTheme(o.v)} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                style={{ position: 'relative', borderRadius: 16, padding: 16, background: o.bg, color: o.fg, border: '1px solid var(--border-strong)', textAlign: 'left' }}
              >
                {theme === o.v && (
                  <motion.span layoutId="theme-ring" transition={spring} style={{ position: 'absolute', inset: -4, borderRadius: 20, border: '2px solid var(--accent)' }} />
                )}
                <o.icon size={20} />
                <div style={{ marginTop: 30, fontWeight: 700 }}>{o.l}</div>
              </motion.button>
            ))}
          </div>

          <div className="card-title" style={{ margin: '26px 0 6px' }}><Bell size={17} /> Avisos</div>
          <div className="list">
            {[
              { k: 'email', icon: Mail, color: '#2563eb', t: 'Alertas por e-mail', s: 'Quedas, vencimentos e renovações' },
              { k: 'whats', icon: MessageCircle, color: '#16a34a', t: 'Alertas no WhatsApp', s: 'Avisos urgentes em tempo real' },
              { k: 'weekly', icon: Bell, color: '#0ea5e9', t: 'Resumo semanal', s: 'Relatório toda segunda-feira' },
              { k: 'twofa', icon: Shield, color: '#16a34a', t: 'Verificação em duas etapas', s: 'Proteção extra no login' },
            ].map((r) => (
              <div key={r.k} className="list-row">
                <IconBox icon={r.icon} color={r.color} size={38} iconSize={18} className="row-icon" />
                <div className="row-main"><b>{r.t}</b><span>{r.s}</span></div>
                <Toggle on={prefs[r.k]} onChange={set(r.k)} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  )
}
