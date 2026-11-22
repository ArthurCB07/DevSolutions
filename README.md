# DevSolutions · Painel do Cliente

Painel onde os clientes da DevSolutions acompanham o bot de WhatsApp, o status do sistema, o domínio e o SSL, além de uma área de conteúdos sobre empreendedorismo. Inclui um painel administrativo para a equipe DevSolutions gerenciar clientes, acessos, planos e conteúdos.

## Stack
- React 18 + Vite
- Framer Motion (animações e transições)
- React Router
- Lucide (ícones)

## Rodando localmente
```bash
npm install
npm run dev
```
Acesse http://localhost:5173.

### Contas de demonstração
| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | tiago@bomgrao.com.br | 123456 |
| Admin | admin@devsolutions.com.br | admin123 |

## Estrutura
```
src/
  auth/        sessão e dados da empresa logada
  components/  layout, menu e componentes animados
  pages/       portal do cliente
  pages/admin/ painel administrativo
  services/    API (hoje simulada no navegador)
docs/          arquitetura de acessos e plano de backend
```

## Status
Os dados ainda são simulados no navegador (`src/services/api.js`). Veja [docs/ACESSOS-E-BACKEND.md](docs/ACESSOS-E-BACKEND.md) para o plano de backend antes de usar com clientes reais.
