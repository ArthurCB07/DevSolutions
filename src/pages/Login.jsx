import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Code2, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, MessageCircle, Activity, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { requestPasswordReset } from '../services/api.js'
import { spring } from '../components/ui.jsx'

const floating = [
  { icon: MessageCircle, color: '#16a34a', title: 'Bot de WhatsApp', sub: '412 conversas hoje', x: '8%', y: '18%', d: 0 },
  { icon: Activity, color: '#2563eb', title: 'Sistema no ar', sub: '99,98% de uptime', x: '52%', y: '38%', d: 1.2 },
  { icon: Globe, color: '#0ea5e9', title: 'Domínio & SSL', sub: 'Renovação automática', x: '14%', y: '60%', d: 2.1 },
]

const demo = [
  { label: 'Cliente', email: 'tiago@bomgrao.com.br', password: '123456' },
  { label: 'Admin DevSolutions', email: 'admin@devsolutions.com.br', password: 'admin123' },
]

function Field({ icon: Icon, right, delay, ...props }) {
  const [focus, setFocus] = useState(false)
  return (
    <motion.label
      className={`field ${focus ? 'focus' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span animate={{ color: focus ? 'var(--accent)' : 'var(--faint)', scale: focus ? 1.1 : 1 }} style={{ display: 'grid' }}>
        <Icon size={18} />
      </motion.span>
      <input {...props} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
      {right}
    </motion.label>
  )
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const shake = useAnimationControls()
  const [mode, setMode] = useState('login') // login | forgot | sent
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const s = await login(email, password)
      setSuccess(true)
      void s
    } catch (err) {
      setError(err.message)
      shake.start({ x: [0, -12, 10, -8, 6, 0], transition: { duration: 0.45 } })
      setLoading(false)
    }
  }

  const forgot = async (e) => {
    e.preventDefault()
    if (!email) return setError('Informe seu e-mail.')
    setError('')
    setLoading(true)
    await requestPasswordReset(email)
    setLoading(false)
    setMode('sent')
  }

  return (
    <div className="login">
      <div className="login-art">
        <motion.div className="login-orb" animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="login-orb two" animate={{ scale: [1.1, 0.9, 1.1], y: [0, -50, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />

        <motion.div className="brand" style={{ padding: 0, color: 'white' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <motion.div className="brand-logo" style={{ background: 'white', color: 'var(--accent)' }} whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }}>
            <Code2 size={22} />
          </motion.div>
          <div>
            <div className="brand-name">DevSolutions</div>
            <div className="brand-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>Painel do cliente</div>
          </div>
        </motion.div>

        <div className="login-floats">
          {floating.map((f, i) => (
            <motion.div
              key={f.title}
              className="float-card"
              style={{ left: f.x, top: f.y }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: [0, -12, 0], scale: 1 }}
              transition={{
                opacity: { delay: 0.3 + i * 0.15 }, scale: { delay: 0.3 + i * 0.15, ...spring },
                y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: f.d },
              }}
            >
              <div className="row-icon" style={{ background: `color-mix(in srgb, ${f.color} 12%, white)`, color: f.color }}><f.icon size={18} /></div>
              <div><b>{f.title}</b><span>{f.sub}</span></div>
              <span className="status-dot" style={{ background: '#16a34a', marginLeft: 'auto' }} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="login-title">Tudo do seu negócio digital, em um só lugar.</h2>
          <p className="login-sub">Acompanhe seu bot, seu sistema e seu domínio — e aprenda a crescer com nossos conteúdos.</p>
        </motion.div>
      </div>

      <div className="login-form-wrap">
        <motion.div className="login-form" animate={shake}>
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={spring} style={{ textAlign: 'center', padding: '40px 0' }}>
                <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...spring, delay: 0.1 }} style={{ display: 'inline-grid', placeItems: 'center', width: 76, height: 76, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)' }}>
                  <CheckCircle2 size={40} />
                </motion.div>
                <h1 style={{ fontSize: 22, marginTop: 18 }}>Tudo certo!</h1>
                <p style={{ color: 'var(--muted)', marginTop: 6 }}>Abrindo seu painel…</p>
              </motion.div>
            ) : mode === 'login' ? (
              <motion.form key="login" onSubmit={submit} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
                <h1>Entrar</h1>
                <p className="login-hint">Use o acesso enviado pela equipe DevSolutions.</p>

                <div style={{ display: 'grid', gap: 12, marginTop: 26 }}>
                  <Field icon={Mail} type="email" placeholder="seu@email.com.br" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required delay={0.1} />
                  <Field
                    icon={Lock} type={show ? 'text' : 'password'} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password" required delay={0.18}
                    right={
                      <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => setShow((s) => !s)} style={{ color: 'var(--faint)', display: 'grid' }} aria-label="Mostrar senha">
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={String(show)} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ display: 'grid' }}>
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    }
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div className="login-error" initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 14 }} exit={{ opacity: 0, height: 0, marginTop: 0 }}>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button type="button" className="link" onClick={() => { setMode('forgot'); setError('') }}>Esqueci minha senha</button>
                </div>

                <motion.button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 18, padding: 14 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {loading ? (
                      <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1, rotate: 360 }} exit={{ opacity: 0 }} transition={{ rotate: { duration: 0.8, repeat: Infinity, ease: 'linear' } }} style={{ display: 'grid' }}>
                        <Loader2 size={18} />
                      </motion.span>
                    ) : (
                      <motion.span key="t" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Entrar <ArrowRight size={17} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.div className="demo-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <span>Contas de demonstração</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {demo.map((d) => (
                      <motion.button key={d.email} type="button" className="pill info" whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setEmail(d.email); setPassword(d.password); setError('') }} style={{ padding: '7px 12px' }}>
                        {d.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.form>
            ) : mode === 'forgot' ? (
              <motion.form key="forgot" onSubmit={forgot} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
                <button type="button" className="link" onClick={() => setMode('login')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}><ArrowLeft size={15} /> Voltar</button>
                <h1>Recuperar acesso</h1>
                <p className="login-hint">Enviaremos um link para você criar uma nova senha.</p>
                <div style={{ marginTop: 26 }}>
                  <Field icon={Mail} type="email" placeholder="seu@email.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required delay={0.1} />
                </div>
                <AnimatePresence>{error && <motion.div className="login-error" initial={{ opacity: 0 }} animate={{ opacity: 1, marginTop: 14 }} exit={{ opacity: 0 }}>{error}</motion.div>}</AnimatePresence>
                <motion.button className="btn primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: 22, padding: 14 }} whileTap={{ scale: 0.97 }}>
                  {loading ? <Loader2 size={18} className="spin" /> : 'Enviar link'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} style={{ textAlign: 'center' }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ display: 'inline-grid', placeItems: 'center', width: 76, height: 76, borderRadius: 24, background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                  <ShieldCheck size={36} />
                </motion.div>
                <h1 style={{ marginTop: 18 }}>Verifique seu e-mail</h1>
                <p className="login-hint">Se <b>{email}</b> estiver cadastrado, você receberá o link em instantes.</p>
                <button className="btn" style={{ marginTop: 22 }} onClick={() => setMode('login')}><ArrowLeft size={16} /> Voltar ao login</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <p className="login-foot">© {new Date().getFullYear()} DevSolutions · Precisa de ajuda? suporte@devsolutions.com.br</p>
      </div>
    </div>
  )
}
