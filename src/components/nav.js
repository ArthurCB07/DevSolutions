import {
  LayoutDashboard, MessageCircle, Activity, Globe, Users, BookOpen, Settings, Building2, Newspaper, ScrollText,
} from 'lucide-react'

/** Menu do portal do cliente. Itens com `module` só aparecem se o módulo estiver contratado. */
export function clientNav(modules = {}) {
  const groups = [
    { label: 'Visão geral', items: [{ to: '/', label: 'Painel', icon: LayoutDashboard }] },
    {
      label: 'Seu sistema',
      items: [
        { to: '/whatsapp', label: 'Bot de WhatsApp', icon: MessageCircle, badge: 'ON', module: 'bot' },
        { to: '/status', label: 'Status do sistema', icon: Activity, module: 'sistema' },
        { to: '/dominio', label: 'Domínio & SSL', icon: Globe, module: 'dominio' },
        { to: '/clientes', label: 'Clientes (CRM)', icon: Users, module: 'crm' },
      ],
    },
    { label: 'Aprender', items: [{ to: '/conteudos', label: 'Conteúdos', icon: BookOpen, badge: 'Novo' }] },
    { label: 'Conta', items: [{ to: '/configuracoes', label: 'Configurações', icon: Settings }] },
  ]
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.module || modules[i.module]) }))
    .filter((g) => g.items.length)
}

export const adminNav = [
  { label: 'Gestão', items: [
    { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, end: true },
    { to: '/admin/clientes', label: 'Clientes', icon: Building2 },
  ] },
  { label: 'Conteúdo', items: [{ to: '/admin/conteudos', label: 'Conteúdos', icon: Newspaper }] },
  { label: 'Segurança', items: [{ to: '/admin/auditoria', label: 'Registro de atividades', icon: ScrollText }] },
]

export const flatNav = (groups) => groups.flatMap((g) => g.items)
