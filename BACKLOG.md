# Backlog do Projeto: PsiClinic (POBD)

Este backlog detalha as tarefas pendentes para a integração completa do frontend com o banco de dados PostgreSQL, organizadas por módulos.

---

## 🟢 Módulo 1: Pacientes e Anamnese
- [ ] **Backend (API):**
    - [ ] Criar rota `POST /api/pacientes` para chamar `sp_registrar_paciente_completo`.
    - [ ] Criar rota `GET /api/pacientes` para consumir a view `vw_pacientes_ativos`.
    - [ ] Criar rota `PUT /api/pacientes/anamnese` para chamar `sp_atualizar_anamnese`.
- [ ] **Frontend (Integração):**
    - [ ] Substituir `mockPatients` na tela de Pacientes por chamada ao `fetch`.
    - [ ] Vincular formulário de "Novo Paciente" à rota de criação.
    - [ ] Implementar carregamento de dados reais na ficha de Anamnese.
    - [ ] Garantir que o cálculo de idade use a function `fn_calcular_idade`.

---

## 🔵 Módulo 2: Agenda de Atendimentos
- [ ] **Backend (API):**
    - [ ] Criar rota `POST /api/agenda` para chamar `sp_agendar_atendimento`.
    - [ ] Criar rota `GET /api/agenda/diaria` para consumir a view `vw_agenda_diaria`.
    - [ ] Criar rotas `PATCH /api/agenda/status` para disparar as procedures de atualização (Confirmar, Cancelar, Falta, etc).
- [ ] **Frontend (Integração):**
    - [ ] Carregar consultas reais no calendário e na lista do dia.
    - [ ] Implementar a lógica de alteração de status via botões de ação na interface.
    - [ ] Validar conflitos de horário (exibir erro retornado pela trigger do banco).

---

## 💰 Módulo 3: Controle Financeiro
- [ ] **Backend (API):**
    - [ ] Criar rota `POST /api/financeiro/receita` para chamar `sp_registrar_receita`.
    - [ ] Criar rota `POST /api/financeiro/despesa` para chamar `sp_registrar_despesa`.
    - [ ] Criar rota `GET /api/financeiro/resumo` para consumir a view `vw_resumo_financeiro_mensal`.
    - [ ] Criar rota `GET /api/financeiro/lucro` para chamar a function `fn_calcular_lucro_liquido`.
- [ ] **Frontend (Integração):**
    - [ ] Atualizar os cards de resumo (Total Receitas, Despesas, Saldo) com dados reais.
    - [ ] Vincular os formulários de entrada e saída de caixa às novas APIs.
    - [ ] Atualizar o gráfico de evolução mensal com dados da view.

---

## 📦 Módulo 4: Controle de Estoque
- [ ] **Backend (API):**
    - [ ] Criar rota `POST /api/estoque/movimentar` para chamar `sp_movimentar_estoque`.
    - [ ] Criar rota `GET /api/estoque/critico` para consumir a view `vw_lista_estoque_critico`.
    - [ ] Criar rota `GET /api/estoque` para listagem geral de itens ativos.
- [ ] **Frontend (Integração):**
    - [ ] Implementar o alerta visual na interface para itens retornados pela view de estoque crítico.
    - [ ] Vincular o modal de movimentação (Entrada/Saída) à API de estoque.
    - [ ] Validar erro de "Estoque Insuficiente" retornado pela procedure do banco.

---

## 📊 Módulo 5: Relatórios e Dashboards
- [ ] **Integração de Dados:**
    - [ ] Criar rotas consolidadas de relatórios usando as Views.
    - [ ] Atualizar todos os gráficos da página `/dashboard/relatorios` para refletir o estado real do banco de dados.
    - [ ] Implementar filtros de data que passem parâmetros para as functions do banco.

---

## 🛠️ Módulo 6: Infraestrutura e Entrega Final
- [ ] **Documentação Técnica:**
    - [ ] Gerar documento descritivo de todas as Stored Procedures, Functions e Triggers (conforme exigência do PDF).
    - [ ] Criar Diagrama de Entidade e Relacionamento (DER) atualizado.
- [ ] **Deploy e Entrega:**
    - [ ] Garantir que todas as variáveis de ambiente (`DATABASE_URL`) estejam configuradas no ambiente de produção.
    - [ ] Validar o versionamento no GitHub.
    - [ ] Gerar o PDF final para submissão no Classroom (Prazo: 03/06).
