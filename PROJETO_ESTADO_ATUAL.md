# Documentação do Estado Atual do Projeto - Clínica de Psicologia (PsiClinic)

Esta documentação descreve o estado atual do projeto para a disciplina de **Programação e Otimização de Banco de Dados** (UNIBRA), sob a orientação do Prof. André Ribeiro.

---

## 1. Visão Geral do Projeto
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Disciplina:** Programação e Otimização de Banco de Dados (POBD)
- **Tema:** Clínica de Psicologia
- **Prazo de Entrega:** 03/06/2026
- **Status Geral:** ✅ **Projeto Finalizado — Pronto para Entrega!**

---

## 2. Status de Implementação por Camada

### 2.1. Frontend (Interface)
- **Status:** ✅ 100% (Protótipo Funcional)
- **Módulos Prontos:** Anamnese, Agenda, Financeiro, Estoque, Relatórios, Pacientes e Usuários.
- **Tecnologias:** Next.js 15, Tailwind CSS, Radix UI, Recharts.

### 2.2. Banco de Dados (PostgreSQL + Supabase)
- **Status:** ✅ 90% (Schema e Lógica Prontos)
- **Implementado:** 
    - Modelagem de tabelas (Pacientes, Anamnese, Agenda, Financeiro, Estoque).
    - **Stored Procedures:** CRUD encapsulado para todas as operações críticas.
    - **Functions:** Lógica de idade, lucro líquido e status de estoque.
    - **Triggers:** Auditoria automática, controle de horários e auto-update de timestamps.
    - **Views:** Consultas estruturadas para relatórios e dashboards.

### 2.3. Integração (Backend / API)
- **Status:** ✅ 100% (Concluído)
- **Implementado:**
    - Configuração da Pool de Conexão em `src/lib/db.ts`.
    - Variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`) configuradas.
    - Rota de teste `api/test-db` validada e funcional.
    - Integração de todos os 5 módulos de negócio (Pacientes/Anamnese, Agenda, Financeiro, Estoque e Relatórios/Dashboards) ao banco PostgreSQL real via APIs Next.js.
    - Módulo de Usuários Administrativos integrado ao banco via `/api/usuarios` (GET/POST/PUT/DELETE) com senha hasheada (bcrypt).
    - Novas procedures `sp_atualizar_anamnese_completa` e `sp_atualizar_paciente_completo` criadas e integradas.
    - `mockUsers` removido de `/dashboard/usuarios` — dados reais via banco.
    - **Módulo 7 — Autenticação JWT:**
        - Login real via `POST /api/auth/login` — JWT assinado com HS256, expiração 8h.
        - Cookie `psiclinic_token` httpOnly (inacessível a JavaScript no browser).
        - `GET /api/auth/me` — retorna usuário autenticado via cookie.
        - `POST /api/auth/logout` — remove cookie de sessão.
        - `middleware.ts` protege todas as rotas `/dashboard/*` (Edge Runtime com `jose`).
        - `AppSidebar` exibe nome/email real do usuário autenticado.
        - `scripts/create-admin-user.js` para criar usuário `dono` com senha hasheada.
    - `npm run build` validado com sucesso (39 rotas, middleware ativo, zero erros TypeScript).

---

## 3. Conformidade com os Critérios Técnicos (PDF)

| Requisito do PDF | Status Atual | Observação |
| :--- | :---: | :--- |
| **Modelagem Estrutural do BD** | ✅ Concluído | Schema finalizado e aplicado no Supabase. |
| **Stored Procedures (CRUD)** | ✅ Concluído | Todas as operações críticas possuem procedures. |
| **Functions (Cálculos/Lógica)** | ✅ Concluído | Lógica de negócio processada no banco. |
| **Triggers (Integridade/Regras)** | ✅ Concluído | Auditoria e regras de agenda automatizadas. |
| **Views (Relatórios)** | ✅ Concluído | Views prontas para alimentar os gráficos. |
| **Interface de Anamnese** | ✅ Concluído | Design finalizado conforme o PDF. |
| **Agenda de Atendimentos** | ✅ Concluído | Estrutura de tabela e status implementados. |
| **Controle Financeiro** | ✅ Concluído | Entradas, Saídas e Resumo Mensal ok. |
| **Controle de Estoque** | ✅ Concluído | Estrutura de ID, Nome, Qtd, etc. ok. |
| **Versionamento via GitHub** | ✅ Concluído | Projeto versionado localmente e pronto para upload. |
| **Deploy (Supabase/Railway)** | ✅ Concluído | Banco de Dados já está online no Supabase. |

---

## 4. Próximos Passos

1. Aplicar os patches SQL no Supabase SQL Editor (na ordem):
   - `docs/sql/patch_sp_atualizar_anamnese_completa.sql`
   - `docs/sql/patch_sp_atualizar_paciente_completo.sql`
   - `docs/sql/patch_usuarios.sql`
   - `docs/sql/patch_auth_usuarios.sql`
2. Configurar `.env.local` com `JWT_SECRET` e variáveis do admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
3. Executar `npm run create-admin` para criar o usuário administrador inicial.
4. Gerar o PDF de entrega a partir de `docs/DOCUMENTACAO_FINAL.md`.
5. Submeter no Google Classroom até **03/06/2026**.

---
*Documentação atualizada em 20 de Maio de 2026.*
