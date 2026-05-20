# PsiClinic — Sistema de Gestão para Clínica de Psicologia

Sistema web de gestão clínica desenvolvido como projeto final da disciplina **Programação e Otimização de Banco de Dados (POBD)** na UNIBRA, sob orientação do professor André Ribeiro.

**Stack:** Next.js 16.2.6 · TypeScript · Tailwind CSS · PostgreSQL (Supabase) · Radix UI · Recharts

---

## Módulos do Sistema

| Módulo | Descrição | Status |
|---|---|---|
| Pacientes e Anamnese | Cadastro, ficha clínica, contato de emergência | Concluído |
| Agenda de Atendimentos | Calendário, status, validação de conflito | Concluído |
| Controle Financeiro | Receitas, despesas, resumo mensal, lucro | Concluído |
| Controle de Estoque | Itens, movimentações, alertas críticos | Concluído |
| Relatórios e Dashboards | Gráficos integrados com views do banco | Concluído |
| Usuários Administrativos | Listagem, cadastro e edição de usuários do sistema | Concluído |

---

## Como Rodar Localmente

### 1. Clone o repositório

```bash
git clone git@github.com:lucasferreirafs/app-clinica-psicologica.git
cd app-clinica-psicologica
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
DATABASE_URL=postgresql://[usuario]:[senha]@[host]:5432/[banco]?sslmode=require
```

> O arquivo `.env.local` está no `.gitignore` e **nunca deve ser commitado**.

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 5. Valide a conexão com o banco

```
http://localhost:3000/api/test-db
```

Resposta esperada: `{ "success": true, "now": "...", "database": "postgres" }`

---

## Banco de Dados

O banco PostgreSQL está hospedado no **Supabase**. O schema completo está em `database_schema.sql`.

| Recurso | Quantidade |
|---|---|
| Tabelas | 11 (+ `usuarios` via patch) |
| Stored Procedures | 14 (+ 2 novas via patches) |
| Functions | 6 |
| Triggers | 17+ |
| Views | 4 |

Para aplicar o schema em um banco novo:
```bash
# Abra o SQL Editor no Supabase Dashboard e cole o conteúdo de database_schema.sql
```

Para aplicar os patches adicionais (após o schema base):
```bash
# Execute em ordem no Supabase SQL Editor:
# 1. docs/sql/patch_sp_atualizar_anamnese_completa.sql
# 2. docs/sql/patch_sp_atualizar_paciente_completo.sql
# 3. docs/sql/patch_usuarios.sql
```

---

## Estrutura de Pastas

```
app-clinica-psicologica/
├── docs/                        # Documentação técnica completa
│   ├── 01-visao-geral.md
│   ├── 02-modelagem-banco.md
│   ├── 03-stored-procedures.md
│   ├── 04-functions.md
│   ├── 05-triggers.md
│   ├── 06-views.md
│   ├── 07-integracao-api.md
│   ├── 08-deploy-e-ambiente.md
│   ├── 09-checklist-entrega.md
│   ├── 10-der-plantuml.md
│   └── DOCUMENTACAO_FINAL.md    # Documento consolidado para PDF
├── src/
│   ├── app/
│   │   ├── api/                 # Route Handlers (server-side)
│   │   │   ├── agenda/
│   │   │   ├── estoque/
│   │   │   ├── financeiro/
│   │   │   ├── pacientes/
│   │   │   ├── profissionais/
│   │   │   ├── relatorios/
│   │   │   ├── usuarios/
│   │   │   └── test-db/
│   │   └── dashboard/           # Páginas do sistema
│   ├── components/              # Componentes reutilizáveis
│   └── lib/
│       └── db.ts                # Conexão com o banco (pool)
├── database_schema.sql          # Schema completo do PostgreSQL
├── .env.local                   # Variáveis de ambiente (não commitado)
└── package.json
```

---

## Rotas Principais da API

| Rota | Descrição |
|---|---|
| `GET /api/test-db` | Valida conexão com o banco |
| `GET /api/pacientes` | Lista pacientes ativos |
| `POST /api/pacientes` | Cadastra novo paciente |
| `GET /api/agenda` | Lista agendamentos |
| `POST /api/agenda` | Cria agendamento |
| `PATCH /api/agenda/status` | Atualiza status do atendimento |
| `GET /api/financeiro/resumo` | Resumo financeiro mensal |
| `GET /api/estoque` | Lista itens de estoque |
| `POST /api/estoque/movimentar` | Movimentação de estoque |
| `GET /api/relatorios/resumo` | Cards do dashboard |
| `GET /api/usuarios` | Lista usuários administrativos |
| `POST /api/usuarios` | Cadastra novo usuário |

Documentação completa das APIs em `docs/07-integracao-api.md`.

---

## Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção (valida TypeScript)
npm start        # Servidor de produção
npm run lint     # Análise estática de código
```

---

## Documentação Técnica

A pasta `docs/` contém documentação técnica completa:

- **`docs/DOCUMENTACAO_FINAL.md`** — Documento consolidado para geração do PDF de entrega.
- **`docs/10-der-plantuml.md`** — DER em PlantUML (visualize em https://www.plantuml.com/plantuml/uml/).

---

## Segurança

- `DATABASE_URL` configurada apenas via variável de ambiente.
- `.env.local` fora do Git (`.gitignore`).
- Todas as queries usam parâmetros (`$1`, `$2`) — sem concatenação de strings.
- `pool` importado exclusivamente em arquivos server-side (API routes).
- Nenhuma credencial no código-fonte.

---

**Prazo de entrega:** 03/06/2026 | **Professor:** André Ribeiro | **Instituição:** UNIBRA
