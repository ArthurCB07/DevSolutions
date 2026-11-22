// Dados de demonstração — substitua pelas chamadas reais da API da DevSolutions.

export const company = {
  client: 'Padaria Bom Grão',
  owner: 'Tiago Moreira',
  initials: 'TM',
  plan: 'Plano Pro',
}

export const kpis = [
  { id: 'msgs', label: 'Mensagens do bot (30d)', value: 18452, trend: 12.4, spark: [30, 42, 38, 51, 47, 60, 58, 72, 69, 80] },
  { id: 'leads', label: 'Novos clientes', value: 326, trend: 8.1, spark: [12, 18, 15, 22, 19, 25, 28, 24, 30, 34] },
  { id: 'uptime', label: 'Uptime do sistema', value: 99.98, decimals: 2, suffix: '%', trend: 0.02, spark: [99, 100, 100, 99.9, 100, 100, 100, 99.95, 100, 100] },
  { id: 'revenue', label: 'Vendas via bot', value: 48290, prefix: 'R$ ', trend: -2.3, spark: [50, 46, 52, 48, 44, 47, 43, 45, 41, 44] },
]

export const revenue = {
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
  data: [18200, 22400, 20100, 27800, 31200, 29400, 36800, 34100, 41900, 45200, 48290],
}

export const activity = [
  { type: 'bot', title: 'Bot respondeu 142 conversas', meta: 'há 4 min', },
  { type: 'deploy', title: 'Nova versão do sistema publicada (v2.8.1)', meta: 'há 32 min' },
  { type: 'lead', title: 'Novo cliente: Mercado São Jorge', meta: 'há 1 h' },
  { type: 'ssl', title: 'Certificado SSL renovado automaticamente', meta: 'há 3 h' },
  { type: 'bot', title: 'Fluxo "Cardápio do dia" atualizado', meta: 'ontem' },
]

export const services = [
  { name: 'Sistema web (app.bomgrao.com.br)', region: 'São Paulo · BR', status: 'ok', latency: 84 },
  { name: 'API de pedidos', region: 'São Paulo · BR', status: 'ok', latency: 112 },
  { name: 'Bot de WhatsApp', region: 'Virgínia · US', status: 'ok', latency: 164 },
  { name: 'Banco de dados', region: 'São Paulo · BR', status: 'ok', latency: 9 },
  { name: 'Envio de e-mails', region: 'Global', status: 'warn', latency: 410 },
  { name: 'Armazenamento de arquivos', region: 'São Paulo · BR', status: 'ok', latency: 58 },
]

export const incidents = [
  { title: 'Lentidão no envio de e-mails', when: 'Agora · em monitoramento', level: 'warn', desc: 'Provedor de e-mail com fila acima do normal. Mensagens estão sendo entregues com até 5 min de atraso.' },
  { title: 'Manutenção programada do banco', when: '12 nov · 02:00–02:20', level: 'info', desc: 'Atualização de segurança concluída sem indisponibilidade.' },
  { title: 'Bot de WhatsApp fora do ar', when: '28 out · 14 min', level: 'bad', desc: 'Instabilidade na API da Meta. Reconexão automática restabeleceu o serviço.' },
]

export const domain = {
  name: 'bomgrao.com.br',
  registrar: 'Registro.br',
  registered: '14/03/2022',
  expires: '14/03/2027',
  daysLeft: 112,
  totalDays: 365,
  autoRenew: true,
  ssl: { issuer: "Let's Encrypt", expires: '18/01/2027', daysLeft: 57 },
  dns: [
    { type: 'A', name: '@', value: '177.71.205.14', ttl: '3600' },
    { type: 'CNAME', name: 'www', value: 'bomgrao.com.br', ttl: '3600' },
    { type: 'CNAME', name: 'app', value: 'apps.devsolutions.com.br', ttl: '300' },
    { type: 'MX', name: '@', value: 'mx.zoho.com (10)', ttl: '3600' },
    { type: 'TXT', name: '@', value: 'v=spf1 include:zoho.com ~all', ttl: '3600' },
  ],
  subdomains: [
    { name: 'www.bomgrao.com.br', status: 'ok' },
    { name: 'app.bomgrao.com.br', status: 'ok' },
    { name: 'api.bomgrao.com.br', status: 'ok' },
    { name: 'loja.bomgrao.com.br', status: 'warn' },
  ],
}

export const botFlows = [
  { id: 'f1', name: 'Boas-vindas', desc: 'Saudação + menu principal', hits: 4210, active: true },
  { id: 'f2', name: 'Cardápio do dia', desc: 'Envia o cardápio com fotos', hits: 3122, active: true },
  { id: 'f3', name: 'Fazer pedido', desc: 'Coleta itens, endereço e pagamento', hits: 2876, active: true },
  { id: 'f4', name: 'Horário de funcionamento', desc: 'Responde horários e endereço', hits: 1530, active: true },
  { id: 'f5', name: 'Falar com atendente', desc: 'Transfere para um humano', hits: 640, active: false },
]

export const botScript = [
  { from: 'in', text: 'Oi! Vocês estão abertos?' },
  { from: 'out', text: 'Olá! 👋 Bem-vindo à Padaria Bom Grão.\nEstamos abertos até as 20h hoje.' },
  { from: 'out', text: 'Como posso ajudar?\n1️⃣ Ver cardápio\n2️⃣ Fazer pedido\n3️⃣ Falar com atendente' },
  { from: 'in', text: '2' },
  { from: 'out', text: 'Perfeito! O que você gostaria de pedir? 🥖' },
]

export const leadsInitial = {
  novo: [
    { id: 'l1', name: 'Mercado São Jorge', contact: 'Ana Lima', value: 1200, tag: 'WhatsApp' },
    { id: 'l2', name: 'Café Aroma', contact: 'Bruno Reis', value: 850, tag: 'Indicação' },
    { id: 'l3', name: 'Doceria Mel', contact: 'Carla Dias', value: 640, tag: 'Instagram' },
  ],
  contato: [
    { id: 'l4', name: 'Restaurante Sabor', contact: 'Diego Alves', value: 2300, tag: 'Site' },
    { id: 'l5', name: 'Hotel Central', contact: 'Elisa Nunes', value: 4800, tag: 'WhatsApp' },
  ],
  proposta: [
    { id: 'l6', name: 'Academia Força', contact: 'Fábio Costa', value: 1750, tag: 'Indicação' },
  ],
  fechado: [
    { id: 'l7', name: 'Pet Shop Amigo', contact: 'Gabi Rocha', value: 990, tag: 'Site' },
    { id: 'l8', name: 'Ótica Visão', contact: 'Hugo Prado', value: 1320, tag: 'Instagram' },
  ],
}

export const columns = [
  { id: 'novo', title: 'Novos', color: '#0ea5e9' },
  { id: 'contato', title: 'Em contato', color: '#2563eb' },
  { id: 'proposta', title: 'Proposta', color: '#f59e0b' },
  { id: 'fechado', title: 'Fechado', color: '#22c55e' },
]

export const contentCategories = [
  { value: 'all', label: 'Todos' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'gestao', label: 'Gestão' },
  { value: 'financas', label: 'Finanças' },
  { value: 'tecnologia', label: 'Tecnologia' },
]

export const contents = [
  {
    id: 'c1', cat: 'vendas', type: 'Artigo', title: 'Como vender mais pelo WhatsApp sem parecer insistente', mins: 6,
    excerpt: 'Técnicas simples para transformar conversas em pedidos usando mensagens automáticas e atendimento humano.',
    color: ['#16a34a', '#0ea5e9'], icon: 'MessageCircle',
    body: [
      'O WhatsApp é o canal onde seu cliente já está. O segredo é usar a automação para responder rápido e deixar o toque humano para os momentos que fazem diferença.',
      'Comece pelo básico: uma mensagem de boas-vindas clara, um menu com no máximo quatro opções e a possibilidade de falar com uma pessoa a qualquer momento.',
      'Depois, acompanhe quais fluxos geram mais pedidos no painel do bot e reforce o que funciona.',
    ],
  },
  {
    id: 'c2', cat: 'marketing', type: 'Guia', title: 'Instagram para pequenos negócios: o plano de 30 dias', mins: 12,
    excerpt: 'Um calendário prático de postagens, stories e anúncios para quem tem pouco tempo e orçamento curto.',
    color: ['#ec4899', '#f59e0b'], icon: 'Megaphone',
    body: [
      'Consistência vale mais que perfeição. Defina três tipos de conteúdo: bastidores, produto e prova social.',
      'Reserve uma hora por semana para produzir tudo em lote e use os agendamentos nativos da plataforma.',
    ],
  },
  {
    id: 'c3', cat: 'gestao', type: 'Checklist', title: '10 processos que todo negócio deveria automatizar', mins: 5,
    excerpt: 'Da confirmação de pedidos ao lembrete de pagamento: o que tirar das suas mãos ainda este mês.',
    color: ['#2563eb', '#0ea5e9'], icon: 'Workflow',
    body: [
      'Automatizar não é substituir pessoas, é liberar tempo para o que realmente importa.',
      'Comece pelas tarefas repetitivas que acontecem todos os dias: confirmação de pedidos, lembretes e respostas frequentes.',
    ],
  },
  {
    id: 'c4', cat: 'financas', type: 'Artigo', title: 'Fluxo de caixa descomplicado para quem não é contador', mins: 8,
    excerpt: 'Entenda entradas, saídas e capital de giro com exemplos do dia a dia de uma pequena empresa.',
    color: ['#22c55e', '#84cc16'], icon: 'Wallet',
    body: [
      'Fluxo de caixa é, basicamente, saber quanto dinheiro entra e sai — e quando.',
      'Separe as contas pessoais das contas da empresa e registre tudo, mesmo os pequenos gastos.',
    ],
  },
  {
    id: 'c5', cat: 'tecnologia', type: 'Vídeo', title: 'Domínio, hospedagem e SSL: o que é cada coisa?', mins: 9,
    excerpt: 'Explicação visual e sem jargões sobre o que mantém o seu site e sistema no ar.',
    color: ['#0ea5e9', '#6366f1'], icon: 'Globe',
    body: [
      'O domínio é o endereço. A hospedagem é o terreno. O SSL é o cadeado que protege quem visita.',
      'No painel da DevSolutions você acompanha os três em tempo real e recebe avisos antes de qualquer vencimento.',
    ],
  },
  {
    id: 'c6', cat: 'vendas', type: 'Template', title: 'Roteiro de atendimento que converte', mins: 4,
    excerpt: 'Modelo pronto para sua equipe usar no primeiro contato, na proposta e no pós-venda.',
    color: ['#f97316', '#ef4444'], icon: 'FileText',
    body: [
      'Um bom roteiro dá segurança à equipe sem engessar a conversa.',
      'Use perguntas abertas, confirme o entendimento e sempre termine com um próximo passo claro.',
    ],
  },
  {
    id: 'c7', cat: 'gestao', type: 'Guia', title: 'Como definir metas que a equipe realmente persegue', mins: 7,
    excerpt: 'Metas claras, mensuráveis e visíveis: um método simples para alinhar todo mundo.',
    color: ['#a855f7', '#ec4899'], icon: 'Target',
    body: [
      'Metas funcionam quando todos sabem o que é sucesso e conseguem acompanhar o progresso.',
      'Mostre os números em um painel visível e celebre pequenas conquistas.',
    ],
  },
  {
    id: 'c8', cat: 'marketing', type: 'Artigo', title: 'Google Meu Negócio: apareça para quem está perto', mins: 6,
    excerpt: 'Passo a passo para otimizar seu perfil e atrair clientes da sua região.',
    color: ['#eab308', '#22c55e'], icon: 'MapPin',
    body: [
      'Fotos atualizadas, horário correto e respostas às avaliações fazem toda a diferença.',
      'Peça avaliações aos clientes satisfeitos logo após a compra — o bot pode fazer isso por você.',
    ],
  },
  {
    id: 'c9', cat: 'financas', type: 'Planilha', title: 'Precificação: quanto cobrar pelo seu produto', mins: 10,
    excerpt: 'Calcule custos, margem e preço final com uma planilha simples e exemplos reais.',
    color: ['#14b8a6', '#0ea5e9'], icon: 'Calculator',
    body: [
      'Preço não é só custo mais lucro: considere impostos, taxas de cartão e o valor percebido.',
      'Revise seus preços a cada trimestre.',
    ],
  },
]
