# Backlog do Projeto: PsiClinic (POBD)

Este backlog detalha as tarefas pendentes para a integração completa do frontend com o banco de dados PostgreSQL, organizadas por módulos.

---

## 🟢 Módulo 1: Pacientes e Anamnese
- [x] **Backend (API):**
    - [x] Criar rota `POST /api/pacientes` para chamar `sp_registrar_paciente_completo`.
    - [x] Criar rota `GET /api/pacientes` para consumir a view `vw_pacientes_ativos`.
    - [x] Criar rota `PUT /api/pacientes/anamnese` para chamar `sp_atualizar_anamnese_completa`.
    - [x] Criar rota `PUT /api/pacientes` para chamar `sp_atualizar_paciente_completo`.
- [x] **Frontend (Integração):**
    - [x] Substituir `mockPatients` na tela de Pacientes por chamada ao `fetch`.
    - [x] Vincular formulário de "Novo Paciente" à rota de criação.
    - [x] Implementar carregamento de dados reais na ficha de Anamnese.
    - [x] Garantir que o cálculo de idade use a function `fn_calcular_idade`.

---

## 🔵 Módulo 2: Agenda de Atendimentos
- [x] **Backend (API):**
    - [x] Criar rota `POST /api/agenda` para chamar `sp_agendar_atendimento`.
    - [x] Criar rota `GET /api/agenda/diaria` para consumir a view `vw_agenda_diaria`.
    - [x] Criar rotas `PATCH /api/agenda/status` para disparar as procedures de atualização (Confirmar, Cancelar, Falta, etc).
- [x] **Frontend (Integração):**
    - [x] Carregar consultas reais no calendário e na lista do dia.
    - [x] Implementar a lógica de alteração de status via botões de ação na interface.
    - [x] Validar conflitos de horário (exibir erro retornado pela trigger do banco).

---

## 💰 Módulo 3: Controle Financeiro
- [x] **Backend (API):**
    - [x] Criar rota `POST /api/financeiro/receita` para chamar `sp_registrar_receita`.
    - [x] Criar rota `POST /api/financeiro/despesa` para chamar `sp_registrar_despesa`.
    - [x] Criar rota `GET /api/financeiro/resumo` para consumir a view `vw_resumo_financeiro_mensal`.
    - [x] Criar rota `GET /api/financeiro/lucro` para chamar a function `fn_calcular_lucro_liquido`.
- [x] **Frontend (Integração):**
    - [x] Atualizar os cards de resumo (Total Receitas, Despesas, Saldo) com dados reais.
    - [x] Vincular os formulários de entrada e saída de caixa às novas APIs.
    - [x] Atualizar o gráfico de evolução mensal com dados da view.

---

## 📦 Módulo 4: Controle de Estoque
- [x] **Backend (API):**
    - [x] Criar rota `POST /api/estoque/movimentar` para chamar `sp_movimentar_estoque`.
    - [x] Criar rota `GET /api/estoque/critico` para consumir a view `vw_lista_estoque_critico`.
    - [x] Criar rota `GET /api/estoque` para listagem geral de itens ativos.
- [x] **Frontend (Integração):**
    - [x] Implementar o alerta visual na interface para itens retornados pela view de estoque crítico.
    - [x] Vincular o modal de movimentação (Entrada/Saída) à API de estoque.
    - [x] Validar erro de "Estoque Insuficiente" retornado pela procedure do banco.

---

## 📊 Módulo 5: Relatórios e Dashboards
- [x] **Integração de Dados:**
    - [x] Criar rotas consolidadas de relatórios usando as Views.
    - [x] Atualizar todos os gráficos da página `/dashboard/relatorios` para refletir o estado real do banco de dados.
    - [x] Implementar filtros de data que passem parâmetros para as functions do banco.

---

## 🛠️ Módulo 6: Infraestrutura e Entrega Final
- [x] **Documentação Técnica:**
    - [x] Gerar documento descritivo de todas as Stored Procedures, Functions e Triggers (conforme exigência do PDF).
    - [x] Criar Diagrama de Entidade e Relacionamento (DER) atualizado.
    - [x] Documentar procedures adicionais: `sp_atualizar_anamnese_completa` e `sp_atualizar_paciente_completo`.
    - [x] Criar patches SQL incrementais em `docs/sql/`.
- [x] **Deploy e Entrega:**
    - [x] Garantir que todas as variáveis de ambiente (`DATABASE_URL`) estejam configuradas no ambiente de produção.
    - [x] Validar o versionamento no GitHub.
    - [ ] Gerar o PDF final para submissão no Classroom (Prazo: 03/06).

---

## ✅ Ajustes Finais de Alinhamento (Bônus — pós-validação)
- [x] Criar `sp_atualizar_anamnese_completa` para cobrir todos os 18 campos clínicos da ficha de anamnese.
- [x] Criar `sp_atualizar_paciente_completo` para encapsular a atualização de paciente + contato de emergência.
- [x] Substituir UPDATE direto e transação manual por chamadas às novas SPs nas rotas de API.
- [x] Integrar `/dashboard/usuarios` com banco real via `GET/POST/PUT/DELETE /api/usuarios`.
- [x] Remover `mockUsers` da tela de Usuários Administradores.
- [x] Criar tabela `usuarios` via patch SQL incremental (`docs/sql/patch_usuarios.sql`).
- [x] `npm run build` validado com sucesso (25 rotas, zero erros TypeScript).

---

## 🔐 Módulo 7: Autenticação JWT
- [x] Criar patch SQL `docs/sql/patch_auth_usuarios.sql` — adiciona `senha_hash`, `ultimo_login`, `tentativas_login`, `bloqueado` à tabela `usuarios`.
- [x] Instalar `bcryptjs` (hash de senhas) e `jose` (JWT compatível com Edge Runtime).
- [x] Criar `.env.example` com placeholders para `DATABASE_URL`, `JWT_SECRET` e variáveis do admin.
- [x] Criar `src/lib/auth.ts` — utilitários `hashPassword`, `comparePassword`, `signJwt`, `verifyJwt`.
- [x] Criar `POST /api/auth/login` — valida credenciais, gera JWT, seta cookie `psiclinic_token` (httpOnly, 8h).
- [x] Criar `POST /api/auth/logout` — remove cookie `psiclinic_token`.
- [x] Criar `GET /api/auth/me` — lê cookie, valida JWT, retorna dados do usuário autenticado.
- [x] Atualizar `POST /api/usuarios` — requer senha (mín. 6 chars), armazena `senha_hash` com bcrypt.
- [x] Atualizar `PUT /api/usuarios` — se senha fornecida, atualiza `senha_hash` com bcrypt.
- [x] Integrar página de login (`/`) com `POST /api/auth/login` real (remover mock setTimeout).
- [x] Criar `middleware.ts` — protege `/dashboard/:path*` via JWT; redireciona `/` → `/dashboard` se autenticado.
- [x] Atualizar `AppSidebar` — exibe nome/email do usuário via `GET /api/auth/me`; logout chama API.
- [x] Atualizar `/dashboard/usuarios` — envia `senha` no POST e opcionalmente no PUT com validação de mín. 6 chars.
- [x] Criar `scripts/create-admin-user.js` — script para criar/atualizar usuário `dono` com senha hasheada.
- [x] Adicionar script `"create-admin"` ao `package.json`.
- [x] `npm run build` validado com sucesso (39 rotas, middleware ativo, zero erros TypeScript).
