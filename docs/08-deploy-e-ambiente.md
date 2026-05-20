# 08 — Deploy e Ambiente

## Variáveis de Ambiente

O projeto utiliza uma única variável de ambiente obrigatória:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | String de conexão PostgreSQL do Supabase |
| `JWT_SECRET` | Sim | Segredo para assinar e verificar tokens JWT (mín. 32 chars) |
| `ADMIN_EMAIL` | Não | E-mail do admin seed (usado por `npm run create-admin`) |
| `ADMIN_NOME` | Não | Nome do admin seed |
| `ADMIN_PASSWORD` | Não | Senha em texto puro do admin seed (hasheada pelo script) |

**Formato esperado (`.env.local`):**
```
DATABASE_URL=postgresql://usuario:senha@host:5432/postgres?sslmode=require
JWT_SECRET=segredo_longo_e_aleatorio_minimo_32_caracteres
```

Para gerar um `JWT_SECRET` seguro:
```bash
openssl rand -base64 64
```

> **IMPORTANTE:** Nunca comite valores reais no repositório. O arquivo `.env.local` está no `.gitignore`.
> Um modelo com placeholders está disponível em `.env.example`.

---

## Configuração Local

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie o arquivo `.env.local`:

```bash
DATABASE_URL=postgresql://[usuario]:[senha]@[host]:5432/[banco]?sslmode=require
```

O arquivo `.env.local` está listado no `.gitignore` e **nunca deve ser commitado**.

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O projeto ficará disponível em `http://localhost:3000`.

### 4. Validar conexão com o banco

Acesse no browser:
```
http://localhost:3000/api/test-db
```

Resposta esperada:
```json
{
  "success": true,
  "now": "2026-05-19T...",
  "database": "postgres"
}
```

Se retornar erro, verificar:
- Se `.env.local` existe na raiz do projeto.
- Se o valor de `DATABASE_URL` está correto.
- Se o IP local está liberado no Supabase (configurações de rede do projeto).

---

## Conexão com o Supabase

O banco de dados PostgreSQL está hospedado no **Supabase**, que fornece:
- Um banco PostgreSQL gerenciado na nuvem.
- Uma string de conexão no formato `postgresql://...`.
- Suporte a SSL (`sslmode=require` ou `rejectUnauthorized: false`).

A conexão é configurada em `src/lib/db.ts`:

```typescript
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
```

`rejectUnauthorized: false` é necessário para conexões SSL com o Supabase sem configurar certificado local. Em ambientes de produção com infraestrutura própria, considere usar `rejectUnauthorized: true` com o certificado correto.

---

## Segurança de Credenciais

| Regra | Implementação |
|---|---|
| `DATABASE_URL` não exposta no frontend | `pool` importado apenas em arquivos de rota (server-side) |
| `.env.local` fora do Git | Coberto pelo `.gitignore` com padrão `.env*` |
| Nenhuma credencial no código-fonte | Todas as configs via variável de ambiente |
| Sem log de `DATABASE_URL` | Apenas erros genéricos são logados em `console.error` |

---

## Build de Produção

### Gerar o build

```bash
npm run build
```

O build Next.js compilará todos os routes handlers e pages. Erros de TypeScript e de configuração são relatados nesta etapa.

### Iniciar em modo produção (local)

```bash
npm start
```

---

## Checklist de Deploy

Antes de fazer deploy em qualquer ambiente externo:

- [ ] Configurar `DATABASE_URL` nas variáveis de ambiente da plataforma de hospedagem.
- [ ] Verificar que o IP/range do servidor de deploy está liberado no Supabase (Dashboard > Settings > Database > Connection Pooling).
- [ ] Executar `npm run build` localmente para garantir que não há erros.
- [ ] Testar `GET /api/test-db` após o deploy para validar conectividade.
- [ ] Testar as rotas principais do sistema:
  - `GET /api/pacientes`
  - `GET /api/agenda/diaria`
  - `GET /api/financeiro/resumo`
  - `GET /api/estoque`
  - `GET /api/relatorios/resumo`
- [ ] Confirmar que `.env.local` não foi commitado (`git status` não deve listá-lo).
- [ ] Confirmar que `node_modules` e `.next` não foram commitados.

---

## Estrutura de Scripts (`package.json`)

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `next dev` | Servidor de desenvolvimento com hot reload |
| `build` | `next build` | Geração do bundle de produção |
| `start` | `next start` | Servidor de produção (requer build prévio) |
| `lint` | `eslint .` | Análise estática de código |
| `create-admin` | `node scripts/create-admin-user.js` | Cria/atualiza usuário `dono` com senha hasheada |

> **Nota:** O script `lint` requer o `eslint` configurado. O arquivo `eslint.config.mjs` está presente na raiz do projeto.

### Criar usuário administrador inicial

Após aplicar o patch SQL de autenticação (`docs/sql/patch_auth_usuarios.sql`), adicione ao `.env.local`:

```
ADMIN_EMAIL=admin@psiclinic.com
ADMIN_NOME=Administrador
ADMIN_PASSWORD=senha_forte_aqui
```

Em seguida execute:

```bash
npm run create-admin
```

O script faz upsert (`INSERT ... ON CONFLICT DO UPDATE`) — pode ser re-executado para trocar a senha.

---

## Variáveis de Ambiente em Deploy na Nuvem

Para deploy em plataformas como **Vercel**, **Railway** ou **Render**:

1. Acesse as configurações do projeto na plataforma.
2. Adicione as variáveis de ambiente:
   - `DATABASE_URL` — string de conexão do Supabase.
   - `JWT_SECRET` — segredo de assinatura JWT (gere com `openssl rand -base64 64`).
3. Faça o deploy (conectando ao repositório GitHub ou via CLI).
4. A plataforma injeta as variáveis no runtime do Next.js automaticamente.

**Vercel (recomendado para Next.js):**
- Dashboard > Project > Settings > Environment Variables.
- Adicione `DATABASE_URL` e `JWT_SECRET`.
- O deploy é disparado automaticamente a cada push na branch principal.
