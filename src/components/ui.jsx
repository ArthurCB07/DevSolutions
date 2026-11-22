import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export const spring = { type: 'spring', stiffness: 380, damping: 30 }
export const softSpring = { type: 'spring', stiffness: 220, damping: 26 }

/* ---------- Page wrapper with staggered children ---------- */
export const pageVariants = {
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  enter: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.05 },
  },
  exit: { opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.25, ease: 'easeIn' } },
}

export const itemVariants = {
  initial: { opacity: 0, y: 22, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0 },
}

export function Page({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}

export function Item({ children, className, style, ...rest }) {
  return (
    <motion.div variants={itemVariants} className={className} style={style} {...rest}>
      {children}
    </motion.div>
  )
}

export function PageHead({ eyebrow, title, subtitle, children }) {
  return (
    <Item className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>}
    </Item>
  )
}

/* ---------- Card with spotlight + 3D tilt ---------- */
export function Card({ children, className = '', tilt = false, style, ...rest }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    if (tilt) {
      ry.set(((x / r.width) - 0.5) * 8)
      rx.set(-((y / r.height) - 0.5) * 8)
    }
  }
  const onLeave = () => { rx.set(0); ry.set(0) }

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      className={`card spot ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900, ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Animated number ---------- */
export function Counter({ value, prefix = '', suffix = '', decimals = 0, duration = 1.4 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)
  const cur = useRef(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(cur.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { cur.current = v; setDisplay(v) },
    })
    return () => controls.stop()
  }, [value, inView, duration])

  const formatted = display.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}

/* ---------- Button with ripple + press ---------- */
export function Button({ children, className = '', onClick, ...rest }) {
  const [ripples, setRipples] = useState([])
  const handle = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const size = Math.max(r.width, r.height) * 2
    const id = Date.now() + Math.random()
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left - size / 2, y: e.clientY - r.top - size / 2, size }])
    setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 650)
    onClick?.(e)
  }
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={spring}
      className={`btn ${className}`}
      onClick={handle}
      {...rest}
    >
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="ripple"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
      {children}
    </motion.button>
  )
}

/* ---------- Icon with hover wiggle ---------- */
export function IconBox({ icon: Icon, color = 'var(--accent)', bg, size = 44, iconSize = 20, className = 'kpi-icon' }) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, background: bg || `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      whileHover={{ rotate: [0, -12, 10, -6, 0], scale: 1.12 }}
      transition={{ duration: 0.6 }}
    >
      <Icon size={iconSize} />
    </motion.div>
  )
}

/* ---------- Toggle ---------- */
export function Toggle({ on, onChange }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <motion.span className="knob" layout transition={spring} />
    </button>
  )
}

/* ---------- Tabs with sliding pill ---------- */
export function Tabs({ tabs, value, onChange, id }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.value} className={`tab ${value === t.value ? 'active' : ''}`} onClick={() => onChange(t.value)}>
          {value === t.value && <motion.span layoutId={`tab-${id}`} className="tab-bg" transition={spring} />}
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Progress bar ---------- */
export function Progress({ value, color, delay = 0.2 }) {
  return (
    <div className="bar">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        style={color ? { background: color } : undefined}
      />
    </div>
  )
}

/* ---------- Circular ring ---------- */
export function Ring({ value, size = 150, stroke = 12, label, sub, color = 'url(#ringGrad)' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--panel-hover)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </svg>
      <div className="ring-label">
        <b>{label}</b>
        <span>{sub}</span>
      </div>
    </div>
  )
}

/* ---------- Area chart (SVG, path draw animation) ---------- */
export function AreaChart({ data, height = 220, color = '#2563eb', id = 'area', labels }) {
  const w = 600
  const max = Math.max(...data) * 1.15
  const min = 0
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, height - ((v - min) / (max - min)) * height])
  const line = pts.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`
    const [px, py] = arr[i - 1]
    const cx = (px + x) / 2
    return `${acc} C ${cx},${py} ${cx},${y} ${x},${y}`
  }, '')
  const area = `${line} L ${w},${height} L 0,${height} Z`
  const [hover, setHover] = useState(null)

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ overflow: 'visible', display: 'block' }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const idx = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1))
          setHover(Math.max(0, Math.min(data.length - 1, idx)))
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={w} y1={height * g} y2={height * g} stroke="var(--border)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        ))}
        <motion.path d={area} fill={`url(#${id}-fill)`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }} />
        <motion.path
          d={line} fill="none" stroke={`url(#${id}-stroke)`} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {hover !== null && (
          <line x1={pts[hover][0]} x2={pts[hover][0]} y1="0" y2={height} stroke="var(--border-strong)" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <AnimatePresence>
        {hover !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, left: `${(pts[hover][0] / w) * 100}%`, top: pts[hover][1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={spring}
            style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
          >
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: color, border: '3px solid var(--panel-solid)', boxShadow: `0 0 0 6px color-mix(in srgb, ${color} 25%, transparent)`, transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 0, transform: 'translateX(-50%)', background: 'var(--panel-solid)', border: '1px solid var(--border-strong)', padding: '6px 10px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: 'var(--shadow)' }}>
              {labels ? `${labels[hover]} · ` : ''}{data[hover].toLocaleString('pt-BR')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: 'var(--faint)' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  )
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color = 'var(--accent)', width = 110, height = 36 }) {
  const max = Math.max(...data), min = Math.min(...data)
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * (height - 4) - 2}`).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.4, delay: 0.3 }} />
    </svg>
  )
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const icons = { ok: [CheckCircle2, 'var(--success)'], info: [Info, 'var(--accent)'], warn: [AlertTriangle, 'var(--warn)'] }

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts">
        <AnimatePresence>
          {toasts.map((t) => {
            const [Icon, color] = icons[t.type] || icons.ok
            return (
              <motion.div
                key={t.id} layout className="toast"
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
                transition={spring}
              >
                <Icon size={20} color={color} />
                <span style={{ flex: 1 }}>{t.msg}</span>
                <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} style={{ color: 'var(--muted)' }}><X size={16} /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Magnetic hover helper ---------- */
export function Magnetic({ children, strength = 0.3 }) {
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 18 }), sy = useSpring(y, { stiffness: 300, damping: 18 })
  return (
    <motion.div
      style={{ x: sx, y: sy, display: 'inline-flex' }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
    >
      {children}
    </motion.div>
  )
}

export { useTransform }
