# Acessos de clientes e gestão — DevSolutions

## Como está organizado hoje (somente front)

| Peça | Arquivo | O que faz |
|---|---|---|
| API simulada | `src/services/api.js` | Clientes, usuários, sessão, conteúdos e auditoria guardados no `localStorage` do navegador |
| Sessão | `src/auth/AuthContext.jsx` | `useAuth()` (usuário, admin?, modo suporte) e `useTenant()` (empresa vista no portal) |
| Rotas protegidas | `src/App.jsx` | `/login`, portal do cliente em `/`, painel admin em `/admin` |
| Menu por plano | `src/components/nav.js` | Esconde módulos não contratados; `ModuleGate` bloqueia o acesso pela URL |

### Modelo de dados
- **Cliente (tenant / empresa)**: empresa, responsável, plano, status (`ativo` / `teste` / `suspenso`), domínio, módulos liberados.
- **Usuário**: nome, e-mail, papel (`admin` = equipe DevSolutions, `client` = cliente), `tenantId` da empresa a que pertence.
- Cada empresa pode ter **vários usuários**. Um usuário vê **apenas** a própria empresa.

### O que o admin consegue fazer
- Criar cliente → gera o primeiro login com senha provisória e a mensagem pronta para enviar.
- Mudar plano, liberar ou bloquear módulos, suspender ou reativar o acesso.
- Criar mais acessos, redefinir senha, remover usuário.
- **Entrar como cliente** (modo suporte) para ver exatamente o que o cliente vê.
- Publicar conteúdos para todos os clientes.
- Ver o registro de atividades (logins, acessos de suporte, alterações).

### Contas de demonstração
- Cliente: `tiago@bomgrao.com.br` / `123456`
- Admin: `admin@devsolutions.com.br` / `admin123`

Para zerar os dados de demonstração, apague as chaves `ds-db-v1` e `ds-session-v1` no localStorage do navegador.

> ⚠️ Nada disso é seguro ainda: as senhas ficam no navegador e qualquer pessoa poderia editar o localStorage.
> Serve para validar a experiência. **Não use com clientes reais antes de ter o backend.**

## Indo para produção

A troca é feita **só em `src/services/api.js`**: cada função mantém o mesmo nome e o mesmo retorno, mas passa a chamar o servidor. As telas não mudam.

Regras que o backend precisa garantir (nunca confiar no front):
1. **Senhas com hash** (bcrypt/argon2) e login gerando um token/cookie seguro (httpOnly).
2. **Isolamento por empresa**: toda consulta filtra pelo `tenant_id` do usuário logado. No Supabase isso vira *Row Level Security*.
3. **Papel admin verificado no servidor** para todas as rotas de `/admin`.
4. **Modo suporte**: o token do admin ganha um `impersonating_tenant_id` temporário, e cada uso entra na auditoria.
5. **Senha provisória**: obrigar a troca no primeiro acesso. Melhor ainda, enviar um link de convite por e-mail em vez da senha.
6. **Suspensão**: bloqueia o login e também derruba as sessões já abertas.

Caminho sugerido: **Supabase** (Auth + Postgres + RLS). Tabelas `tenants`, `profiles` (user_id, tenant_id, role), `contents` e `audit_log`. As ações de admin (criar usuário, redefinir senha) rodam em uma *Edge Function* com a service key, nunca no navegador.
