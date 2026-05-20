# 07 — Integração com API

## Visão Geral

Todas as rotas de API foram implementadas como **Route Handlers do Next.js 15** (App Router), localizadas em `src/app/api/`. O acesso ao banco de dados ocorre exclusivamente no lado do servidor, utilizando a `pool` exportada de `src/lib/db.ts`.

**Regras aplicadas em todas as rotas:**
- `pool` nunca é importado em componentes client-side.
- Queries parametrizadas (`$1`, `$2`, ...) em 100% das operações — sem concatenação de strings.
- `DATABASE_URL` nunca é exposta em respostas ou logs do frontend.
- Operações de escrita em tabelas de domínio passam obrigatoriamente por stored procedures.

**Formato padrão de resposta:**
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Descrição do erro" }
```

---

## Módulo: Pacientes

### `GET /api/pacientes`

**Objetivo:** Listar todos os pacientes ativos ou buscar um paciente específico por ID.

**Query params:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID (string) | Não | Se informado, retorna apenas o paciente com esse ID, incluindo contato de emergência |

**Fonte de dados:**
- Sem `id`: `SELECT ... FROM vw_pacientes_ativos ORDER BY nome_completo ASC`
- Com `id`: JOIN entre `pacientes` e `contatos_emergencia`

**Exemplo de resposta (listagem):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nome_completo": "Maria Silva", "email": "...", "telefone": "...", "idade": 35 }
  ]
}
```

**Erros possíveis:**
- `404` — Paciente não encontrado (com `id`)
- `500` — Erro de conexão ou query

---

### `POST /api/pacientes`

**Objetivo:** Cadastrar um novo paciente de forma transacional.

**Body (JSON):**
```json
{
  "nomeCompleto": "string",
  "dataNascimento": "YYYY-MM-DD",
  "cpf": "string",
  "telefone": "string",
  "email": "string",
  "endereco": "string | null",
  "profissao": "string | null",
  "estadoCivil": "string | null",
  "contatoEmergenciaNome": "string",
  "contatoEmergenciaTelefone": "string",
  "contatoEmergenciaRelacao": "string",
  "motivoConsulta": "string",
  "tempoQueixa": "string | null"
}
```

**Procedure chamada:** `CALL sp_registrar_paciente_completo($1...$13)`

**Erros possíveis:**
- `400` — Campos obrigatórios ausentes
- `500` — CPF/e-mail duplicado (violação de UNIQUE) ou erro de banco

---

### `PUT /api/pacientes`

**Objetivo:** Atualizar dados cadastrais de um paciente existente, incluindo contato de emergência.

**Body (JSON):** Mesmos campos do POST, mais `id` (UUID).

**Procedure chamada:** `CALL sp_atualizar_paciente_completo($1...$12)`

A procedure encapsula a lógica de atualização do paciente e do contato de emergência, eliminando a necessidade de gerenciar a transação na camada de aplicação.

**Erros possíveis:**
- `400` — Campos obrigatórios ausentes
- `500` — Erro de banco

---

### `DELETE /api/pacientes`

**Objetivo:** Inativar logicamente um paciente.

**Query params:** `id` (UUID)

**Operação:** `UPDATE pacientes SET ativo = FALSE WHERE id = $1`

---

### `PUT /api/pacientes/anamnese`

**Objetivo:** Atualizar todos os 18 campos clínicos da ficha de anamnese de um paciente.

**Body (JSON) — campos principais:**
```json
{
  "anamneseId": "uuid",
  "mainComplaint": "string",
  "problemDuration": "string",
  "previousTherapy": "sim | nao",
  "previousTherapyDetails": "string | null",
  "physicalDiseases": "string | null",
  "medications": "string | null",
  "psychiatricHistory": "string | null",
  "familyMentalHealth": "string | null",
  "familyRelationship": "string | null",
  "sleepQuality": "string | null",
  "eatingHabits": "string | null",
  "substanceUse": "string | null",
  "physicalActivity": "string | null",
  "anxietyLevel": "leve | moderada | intensa | null",
  "moodDescription": "string | null",
  "stressLevel": "string | null",
  "recurrentThoughts": "string | null",
  "therapyGoal": "string | null",
  "psychologistNotes": "string | null"
}
```

**Procedure chamada:** `CALL sp_atualizar_anamnese_completa($1...$20)`

Substituiu o UPDATE direto (20 parâmetros) que havia na implementação anterior. A procedure `sp_atualizar_anamnese` original (3 parâmetros) foi mantida por compatibilidade.

---

## Módulo: Agenda

### `GET /api/agenda`

**Objetivo:** Listar todos os agendamentos ativos, com suporte a filtro por data específica.

**Query params:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `data` | YYYY-MM-DD | Não | Se informado, retorna apenas agendamentos daquele dia |

**Fonte de dados:** JOIN entre `agenda`, `pacientes` e `profissionais`.

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "data_atendimento": "2026-05-19",
      "hora_atendimento": "09:00:00",
      "tipo": "presencial",
      "status": "agendado",
      "paciente": "Maria Silva",
      "profissional": "Dr. João"
    }
  ]
}
```

---

### `POST /api/agenda`

**Objetivo:** Criar um novo agendamento de atendimento.

**Body (JSON):**
```json
{
  "dataAtendimento": "YYYY-MM-DD",
  "horaAtendimento": "HH:MM",
  "pacienteId": "uuid",
  "profissionalId": "uuid",
  "tipo": "presencial | online",
  "observacoes": "string | null"
}
```

**Procedure chamada:** `CALL sp_agendar_atendimento($1::DATE, $2::TIME, $3::UUID, $4::UUID, $5::tipo_atendimento, $6::TEXT)`

**Erros possíveis:**
- `400` — Campos ausentes ou tipo inválido
- `409` — Conflito de horário (trigger lança exceção no banco)
- `500` — Erro interno

---

### `GET /api/agenda/diaria`

**Objetivo:** Listar os atendimentos do dia atual.

**Fonte de dados:** `SELECT ... FROM vw_agenda_diaria ORDER BY hora_atendimento ASC`

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    { "hora_atendimento": "09:00:00", "paciente": "Maria", "profissional": "Dr. João", "tipo": "presencial", "status": "confirmado" }
  ]
}
```

---

### `PATCH /api/agenda/status`

**Objetivo:** Atualizar o status de um agendamento via uma das ações disponíveis.

**Body (JSON):**
```json
{
  "agendaId": "uuid",
  "acao": "confirmar | cancelar | realizar | falta"
}
```

**Mapeamento de ações para procedures:**

| Ação | Procedure |
|---|---|
| `confirmar` | `sp_confirmar_atendimento` |
| `cancelar` | `sp_cancelar_atendimento` |
| `realizar` | `sp_marcar_atendimento_realizado` |
| `falta` | `sp_marcar_falta_atendimento` |

**Erros possíveis:**
- `400` — `agendaId` ausente ou ação inválida
- `500` — Erro de banco

---

## Módulo: Financeiro

### `GET /api/financeiro/receita`

**Objetivo:** Listar todas as receitas ativas com nome do paciente.

**Fonte de dados:** JOIN entre `financeiro_receitas` e `pacientes WHERE fr.ativo = TRUE`

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "data_receita": "2026-05-01", "servico": "Sessão", "valor": 200.00, "status": "pago", "paciente": "Maria Silva" }
  ]
}
```

---

### `POST /api/financeiro/receita`

**Objetivo:** Registrar uma nova receita.

**Body (JSON):**
```json
{
  "pacienteId": "uuid",
  "servico": "string",
  "formaPagamento": "string | null",
  "valor": 200.00
}
```

**Procedure chamada:** `CALL sp_registrar_receita($1, $2, $3, $4)`

**Retorno:** `{ "success": true, "id": "uuid-nova-receita" }` — O ID é recuperado por SELECT após o CALL para permitir que a API chame `sp_atualizar_status_pagamento` em sequência, se necessário.

---

### `DELETE /api/financeiro/receita`

**Objetivo:** Inativar logicamente uma receita.

**Query params:** `id` (UUID)

---

### `PATCH /api/financeiro/receita/status`

**Objetivo:** Atualizar o status de pagamento de uma receita.

**Body (JSON):**
```json
{ "receitaId": "uuid", "status": "pago | pendente | cancelado" }
```

**Procedure chamada:** `CALL sp_atualizar_status_pagamento($1, $2::status_pagamento)`

---

### `GET /api/financeiro/despesa`

**Objetivo:** Listar todas as despesas ativas.

**Fonte de dados:** `SELECT ... FROM financeiro_despesas WHERE ativo = TRUE`

---

### `POST /api/financeiro/despesa`

**Objetivo:** Registrar uma nova despesa.

**Body (JSON):**
```json
{
  "descricao": "string",
  "categoria": "string | null",
  "valor": 150.00
}
```

**Procedure chamada:** `CALL sp_registrar_despesa($1, $2, $3)`

---

### `DELETE /api/financeiro/despesa`

**Objetivo:** Inativar logicamente uma despesa.

**Query params:** `id` (UUID)

---

### `GET /api/financeiro/resumo`

**Objetivo:** Retornar o resumo financeiro mensal histórico para alimentar gráficos.

**Fonte de dados:** `SELECT ... FROM vw_resumo_financeiro_mensal ORDER BY ano ASC, mes ASC`

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    { "ano": 2026, "mes": 1, "totalReceitas": 4000.00, "totalDespesas": 1500.00, "lucroLiquido": 2500.00 }
  ]
}
```

---

### `GET /api/financeiro/lucro`

**Objetivo:** Calcular o lucro líquido de um período específico via function do banco.

**Query params:**

| Parâmetro | Obrigatório | Exemplo |
|---|---|---|
| `dataInicio` | Sim | `2026-01-01` |
| `dataFim` | Sim | `2026-03-31` |

**Function chamada:** `SELECT fn_calcular_lucro_liquido($1, $2) AS lucro_liquido`

---

## Módulo: Estoque

### `GET /api/estoque`

**Objetivo:** Listar todos os itens de estoque ativos com status calculado.

**Fonte de dados:** `SELECT ..., fn_verificar_status_estoque(id) AS status_estoque FROM estoque_itens WHERE ativo = TRUE`

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nomeProduto": "Folha A4", "categoria": "Papelaria", "quantidadeAtual": 3, "quantidadeMinima": 10, "statusEstoque": "CRÍTICO" }
  ]
}
```

---

### `POST /api/estoque`

**Objetivo:** Cadastrar um novo item de estoque.

**Body (JSON):**
```json
{
  "nomeProduto": "string",
  "categoria": "string",
  "quantidadeAtual": 0,
  "quantidadeMinima": 5,
  "fornecedor": "string"
}
```

**Operação:** `INSERT INTO estoque_itens (...) RETURNING id`

---

### `PATCH /api/estoque`

**Objetivo:** Atualizar metadados de um item (nome, categoria, quantidade mínima, fornecedor). Quantidade atual não é alterada por este endpoint — use `/api/estoque/movimentar`.

**Body (JSON):**
```json
{
  "id": "uuid",
  "nomeProduto": "string",
  "categoria": "string",
  "quantidadeMinima": 10,
  "fornecedor": "string"
}
```

---

### `DELETE /api/estoque`

**Objetivo:** Inativar logicamente um item de estoque.

**Query params:** `id` (UUID)

---

### `GET /api/estoque/critico`

**Objetivo:** Listar itens abaixo da quantidade mínima.

**Fonte de dados:** `SELECT ... FROM vw_lista_estoque_critico ORDER BY nome_produto ASC`

---

### `POST /api/estoque/movimentar`

**Objetivo:** Registrar uma movimentação de entrada ou saída de estoque.

**Body (JSON):**
```json
{
  "itemId": "uuid",
  "tipo": "entrada | saida",
  "quantidade": 10,
  "observacao": "string | null"
}
```

**Procedure chamada:** `CALL sp_movimentar_estoque($1, $2, $3, $4)`

**Erros possíveis:**
- `400` — Campos ausentes, tipo inválido ou item não encontrado
- `409` — Estoque insuficiente para saída
- `500` — Erro interno

---

## Módulo: Relatórios

### `GET /api/relatorios/resumo`

**Objetivo:** Retornar os 4 indicadores-chave para os cards do dashboard principal.

**Query params (opcionais):**

| Parâmetro | Descrição |
|---|---|
| `dataInicio` | Início do período para cálculo de lucro |
| `dataFim` | Fim do período para cálculo de lucro |

**Fontes de dados:** `vw_pacientes_ativos` (COUNT), `vw_agenda_diaria` (COUNT), `vw_lista_estoque_critico` (COUNT), `vw_resumo_financeiro_mensal` (LIMIT 1) e opcionalmente `fn_calcular_lucro_liquido`.

---

### `GET /api/relatorios/financeiro`

**Objetivo:** Retornar o histórico financeiro mensal completo para gráficos.

**Fonte de dados:** `SELECT ... FROM vw_resumo_financeiro_mensal ORDER BY ano ASC, mes ASC`

---

### `GET /api/relatorios/pacientes`

**Objetivo:** Retornar estatísticas de pacientes e evolução mensal de novos cadastros.

**Fontes de dados:**
- Stats: `SELECT COUNT, AVG(idade), MIN(idade), MAX(idade) FROM vw_pacientes_ativos`
- Mensais: `SELECT TO_CHAR(DATE_TRUNC('month', criado_em), 'MM/YYYY'), COUNT(*) FROM pacientes WHERE ativo = TRUE GROUP BY ...`

---

### `GET /api/relatorios/agenda`

**Objetivo:** Retornar distribuição de status, evolução mensal e agenda diária para os gráficos da aba de Agenda.

**Query params (opcionais):** `dataInicio`, `dataFim` — filtram o resumo de status e os dados mensais.

**Fontes de dados:** `vw_agenda_diaria` + queries diretas em `agenda` com GROUP BY.

---

### `GET /api/relatorios/estoque`

**Objetivo:** Retornar resumo do estoque (totais, categorias, itens críticos) para a aba de Estoque nos Relatórios.

**Fontes de dados:** `vw_lista_estoque_critico` + queries diretas em `estoque_itens` com `fn_verificar_status_estoque`.

---

## Módulo: Usuários

### `GET /api/usuarios`

**Objetivo:** Listar todos os usuários administrativos ativos do sistema.

**Fonte de dados:** `SELECT ... FROM usuarios WHERE ativo = TRUE ORDER BY nome ASC`

**Exemplo de resposta:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "nome": "Administrador", "email": "admin@psiclinic.com", "perfil": "dono", "criado_em": "2026-05-20" }
  ]
}
```

---

### `POST /api/usuarios`

**Objetivo:** Criar um novo usuário administrativo.

**Body (JSON):**
```json
{
  "nome": "string",
  "email": "string",
  "perfil": "dono | admin"
}
```

**Operação:** `INSERT INTO usuarios (nome, email, perfil) VALUES ($1, $2, $3)`

**Erros possíveis:**
- `400` — Campos obrigatórios ausentes ou perfil inválido
- `409` — E-mail duplicado
- `500` — Erro interno

---

### `PUT /api/usuarios`

**Objetivo:** Atualizar dados de um usuário administrativo.

**Body (JSON):**
```json
{
  "id": "uuid",
  "nome": "string",
  "email": "string",
  "perfil": "dono | admin"
}
```

**Operação:** `UPDATE usuarios SET nome = $1, email = $2, perfil = $3 WHERE id = $4 AND ativo = TRUE`

---

### `DELETE /api/usuarios`

**Objetivo:** Inativar logicamente um usuário administrativo. Usuários com perfil `dono` não podem ser excluídos.

**Query params:** `id` (UUID)

**Operação:** Validação de perfil + `UPDATE usuarios SET ativo = FALSE WHERE id = $1`

**Erros possíveis:**
- `403` — Tentativa de excluir usuário proprietário
- `404` — Usuário não encontrado

---

**Nota:** A tela `/dashboard/usuarios` passou a utilizar esta API com dados reais do banco, substituindo o `mockUsers` que havia na implementação anterior. Senhas não são armazenadas — a autenticação real requer implementação futura com hashing adequado.

---

## Pendências de Integração

| Rota | Status | Observação |
|---|---|---|
| `GET /api/estoque/movimentacoes` | Não implementado | Histórico de movimentações por item — fora do escopo do backlog |
| Edição de receita (PATCH completo) | Parcial | Apenas status é editável; edição de valor/serviço está pendente |

---

## Rota de Diagnóstico

### `GET /api/test-db`

**Objetivo:** Validar a conectividade com o banco de dados PostgreSQL do Supabase.

**Fonte de dados:** `SELECT NOW() AS now, current_database() AS database`

**Uso:** Acessar `/api/test-db` no browser ou via curl para confirmar que `DATABASE_URL` está configurada e o banco está acessível.
