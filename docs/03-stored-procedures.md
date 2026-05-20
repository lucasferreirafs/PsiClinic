# 03 — Stored Procedures

## Visão Geral

O PsiClinic utiliza **14 stored procedures** escritas em PL/pgSQL para encapsular todas as operações de escrita no banco de dados. A aplicação Next.js **nunca executa INSERT/UPDATE diretamente** em tabelas de domínio — toda operação crítica é delegada a uma procedure correspondente.

As procedures `sp_atualizar_anamnese_completa` e `sp_atualizar_paciente_completo` foram adicionadas via patches SQL incrementais em `docs/sql/`, após a validação final do projeto. Isso garantiu que as rotas `PUT /api/pacientes/anamnese` e `PUT /api/pacientes` deixassem de usar UPDATE direto e passassem a usar procedures, alinhando-se ao padrão de POBD.

Este padrão garante:
- Centralização da lógica de negócio no banco.
- Validações atômicas antes de qualquer persistência.
- Consistência mesmo em caso de acesso direto ao banco por outra ferramenta.
- Rastreabilidade via triggers de auditoria disparadas após cada operação.

---

## Pacientes e Anamnese

### `sp_registrar_paciente_completo`

**Objetivo:** Cadastrar um novo paciente de forma transacional, criando simultaneamente o registro na tabela `pacientes`, o contato de emergência em `contatos_emergencia` e a anamnese inicial em `anamneses`. Se qualquer etapa falhar, toda a operação é revertida automaticamente.

**Parâmetros:**

| Parâmetro | Tipo | Obrigatoriedade |
|---|---|---|
| `p_nome` | VARCHAR | Obrigatório |
| `p_nascimento` | DATE | Obrigatório |
| `p_cpf` | CHAR | Obrigatório |
| `p_tel` | VARCHAR | Obrigatório |
| `p_email` | VARCHAR | Obrigatório |
| `p_end` | TEXT | Opcional (NULL) |
| `p_prof` | VARCHAR | Opcional (NULL) |
| `p_civil` | VARCHAR | Opcional (NULL) |
| `p_emerg_nome` | VARCHAR | Obrigatório |
| `p_emerg_tel` | VARCHAR | Obrigatório |
| `p_emerg_rel` | VARCHAR | Obrigatório |
| `p_motivo` | TEXT | Obrigatório |
| `p_queixa_tempo` | VARCHAR | Opcional (NULL) |

**Tabelas afetadas:** `pacientes`, `contatos_emergencia`, `anamneses`

**Regra de negócio:** Gera o UUID do paciente internamente com `RETURNING id INTO v_paciente_id`, usando-o como chave estrangeira nas inserções subsequentes. Garante que não existam pacientes sem contato de emergência ou sem anamnese inicial no banco.

**Exemplo de chamada:**
```sql
CALL sp_registrar_paciente_completo(
  'Maria Silva', '1990-05-15', '123.456.789-00',
  '(81) 99999-0000', 'maria@email.com', 'Rua A, 123',
  'Professora', 'Solteira',
  'João Silva', '(81) 88888-0000', 'Pai',
  'Ansiedade generalizada', '6 meses'
);
```

**Observações:** CPF e e-mail possuem constraint UNIQUE no banco — duplicatas retornam erro de violação de constraint, tratado pela API como erro 409 ou 500.

---

### `sp_atualizar_anamnese`

**Objetivo:** Permite que o psicólogo registre observações clínicas, objetivo terapêutico e nível de ansiedade avaliado (3 campos). Mantida por compatibilidade. Para atualização completa da ficha, use `sp_atualizar_anamnese_completa`.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_anamnese_id` | UUID | ID da anamnese a ser atualizada |
| `p_obs_psicologo` | TEXT | Observações do profissional |
| `p_objetivo` | TEXT | Objetivo terapêutico definido |
| `p_ansiedade` | nivel_ansiedade | Nível: `leve`, `moderada` ou `intensa` |

**Tabelas afetadas:** `anamneses`

**Regra de negócio:** Atualiza apenas registros com `ativo = TRUE`, ignorando anamneses inativadas.

**Exemplo de chamada:**
```sql
CALL sp_atualizar_anamnese(
  'uuid-da-anamnese',
  'Paciente demonstra melhora na regulação emocional.',
  'Reduzir episódios de ansiedade em situações sociais.',
  'moderada'
);
```

---

### `sp_atualizar_anamnese_completa`

**Objetivo:** Atualizar todos os campos clínicos da ficha de anamnese de um paciente. Criada para cobrir os 18 campos que a tela de Anamnese gerencia, substituindo o UPDATE direto que havia na rota `PUT /api/pacientes/anamnese`. A procedure original `sp_atualizar_anamnese` (3 campos) foi mantida por compatibilidade.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_anamnese_id` | UUID | ID da anamnese a ser atualizada |
| `p_motivo_consulta` | TEXT | Motivo da consulta (COALESCE — preserva o atual se null) |
| `p_tempo_queixa` | VARCHAR(50) | Duração da queixa principal |
| `p_fez_terapia` | BOOLEAN | Se já realizou terapia antes |
| `p_terapia_tempo` | VARCHAR(50) | Tempo de terapia anterior |
| `p_doencas_fisicas` | TEXT | Doenças físicas relatadas |
| `p_medicamentos` | TEXT | Uso de medicamentos |
| `p_hist_psiquiatrico` | TEXT | Histórico psiquiátrico |
| `p_doencas_mentais` | TEXT | Doenças mentais na família |
| `p_relacao_familiar` | TEXT | Descrição da relação familiar |
| `p_sono` | TEXT | Hábitos de sono |
| `p_alimentacao` | TEXT | Hábitos alimentares |
| `p_substancias` | TEXT | Uso de substâncias |
| `p_atividade` | TEXT | Prática de atividade física |
| `p_ansiedade` | nivel_ansiedade | Nível avaliado: `leve`, `moderada` ou `intensa` |
| `p_humor` | TEXT | Descrição do humor |
| `p_estresse` | TEXT | Nível de estresse |
| `p_pensamentos` | TEXT | Pensamentos recorrentes |
| `p_objetivo` | TEXT | Objetivo terapêutico |
| `p_observacoes` | TEXT | Observações do psicólogo |

**Tabelas afetadas:** `anamneses`

**Regra de negócio:** Atualiza apenas registros com `ativo = TRUE`. O campo `atualizado_em` é atualizado automaticamente pela trigger `trg_upd_timestamp_anamneses`. O `motivo_consulta` usa `COALESCE` para preservar o valor existente quando o parâmetro é `null`.

**Origem:** Criada via `docs/sql/patch_sp_atualizar_anamnese_completa.sql`.

**Exemplo de chamada:**
```sql
CALL sp_atualizar_anamnese_completa(
  'uuid-anamnese',
  'Ansiedade generalizada',
  '6 meses',
  TRUE,
  '2 anos',
  NULL, NULL, NULL, NULL, NULL,
  'Dorme bem', 'Regular', NULL, 'Caminhada',
  'moderada',
  'Estável', 'Médio', NULL,
  'Reduzir episódios de ansiedade',
  'Paciente demonstra progresso.'
);
```

---

### `sp_atualizar_paciente_completo`

**Objetivo:** Atualizar dados cadastrais de um paciente ativo e seu contato de emergência de forma transacional. Criada para substituir o `BEGIN/COMMIT/ROLLBACK` manual que havia na camada de aplicação da rota `PUT /api/pacientes`.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_paciente_id` | UUID | ID do paciente a ser atualizado |
| `p_nome` | VARCHAR(150) | Nome completo |
| `p_nascimento` | DATE | Data de nascimento |
| `p_cpf` | CHAR(14) | CPF |
| `p_tel` | VARCHAR(20) | Telefone |
| `p_email` | VARCHAR(100) | E-mail |
| `p_end` | TEXT | Endereço (opcional — NULL permitido) |
| `p_prof` | VARCHAR(100) | Profissão (opcional — NULL permitido) |
| `p_civil` | VARCHAR(50) | Estado civil (opcional — NULL permitido) |
| `p_emerg_nome` | VARCHAR(150) | Nome do contato de emergência |
| `p_emerg_tel` | VARCHAR(20) | Telefone do contato de emergência |
| `p_emerg_rel` | VARCHAR(50) | Relação com o paciente |

**Tabelas afetadas:** `pacientes`, `contatos_emergencia`

**Regra de negócio:** Atualiza o paciente com `ativo = TRUE`. Para o contato de emergência: se já existir um contato ativo, é atualizado; caso contrário, um novo é inserido. Se `p_emerg_nome` for `NULL`, o contato não é alterado. O campo `atualizado_em` é atualizado automaticamente pela trigger `trg_upd_timestamp_pacientes`.

**Origem:** Criada via `docs/sql/patch_sp_atualizar_paciente_completo.sql`.

**Exemplo de chamada:**
```sql
CALL sp_atualizar_paciente_completo(
  'uuid-paciente',
  'Maria Silva Atualizado', '1990-05-15', '123.456.789-00',
  '(81) 99999-0001', 'maria.novo@email.com',
  'Rua B, 456', 'Engenheira', 'Casada',
  'João Silva', '(81) 88888-0001', 'Pai'
);
```

---

## Agenda

### `sp_agendar_atendimento`

**Objetivo:** Inserir um novo registro de agendamento na agenda da clínica.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_data` | DATE | Data do atendimento |
| `p_hora` | TIME | Horário do atendimento |
| `p_paciente` | UUID | ID do paciente |
| `p_profissional` | UUID | ID do profissional |
| `p_tipo` | tipo_atendimento | `presencial` ou `online` |
| `p_obs` | TEXT | Observações (opcional) |

**Tabelas afetadas:** `agenda`

**Regra de negócio:** Ao executar o INSERT, a trigger `trg_verificar_agenda` é disparada automaticamente (BEFORE INSERT) e valida conflito de horário para o mesmo profissional. Se houver conflito, a exceção `'Conflito de agenda: ...'` é lançada e o agendamento é cancelado.

**Exemplo de chamada:**
```sql
CALL sp_agendar_atendimento(
  '2026-06-01', '09:00',
  'uuid-paciente', 'uuid-profissional',
  'presencial', 'Primeira consulta'
);
```

---

### `sp_atualizar_status_atendimento`

**Objetivo:** Procedure base para alteração de status de qualquer agendamento ativo. As demais procedures de status a chamam internamente.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_agenda_id` | UUID | ID do agendamento |
| `p_status` | status_atendimento | Novo status (ENUM) |

**Tabelas afetadas:** `agenda`

**Regra de negócio:** Atualiza apenas registros com `ativo = TRUE`. A trigger `trg_audit_agenda` registra a mudança na tabela `auditoria`.

**Exemplo de chamada:**
```sql
CALL sp_atualizar_status_atendimento('uuid-agenda', 'realizado');
```

---

### `sp_confirmar_atendimento`

**Objetivo:** Marcar um agendamento como `confirmado`. Wrapper semântico de `sp_atualizar_status_atendimento`.

**Parâmetros:** `p_agenda_id UUID`

**Tabelas afetadas:** `agenda` (via sp_atualizar_status_atendimento)

**Exemplo:**
```sql
CALL sp_confirmar_atendimento('uuid-agenda');
```

---

### `sp_cancelar_atendimento`

**Objetivo:** Marcar um agendamento como `cancelado`.

**Parâmetros:** `p_agenda_id UUID`

**Exemplo:**
```sql
CALL sp_cancelar_atendimento('uuid-agenda');
```

---

### `sp_marcar_atendimento_realizado`

**Objetivo:** Registrar que um atendimento foi efetivamente realizado (`status = 'realizado'`).

**Parâmetros:** `p_agenda_id UUID`

**Exemplo:**
```sql
CALL sp_marcar_atendimento_realizado('uuid-agenda');
```

---

### `sp_marcar_falta_atendimento`

**Objetivo:** Registrar a falta do paciente no horário agendado (`status = 'faltou'`).

**Parâmetros:** `p_agenda_id UUID`

**Exemplo:**
```sql
CALL sp_marcar_falta_atendimento('uuid-agenda');
```

**Observações sobre o grupo de agenda:** A API `PATCH /api/agenda/status` utiliza um mapeamento interno (`SP_MAP`) que traduz a ação recebida (`confirmar`, `cancelar`, `realizar`, `falta`) para a procedure correspondente. A chamada é feita com `CALL ${sp}($1::UUID)`, garantindo que apenas procedures válidas sejam invocadas.

---

## Financeiro

### `sp_registrar_receita`

**Objetivo:** Inserir um novo registro de receita financeira vinculado a um paciente.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_paciente` | UUID | ID do paciente |
| `p_servico` | VARCHAR | Descrição do serviço |
| `p_forma` | VARCHAR | Forma de pagamento (pode ser NULL) |
| `p_valor` | DECIMAL | Valor da receita (>= 0) |

**Tabelas afetadas:** `financeiro_receitas`

**Regra de negócio:** O status padrão é `'pago'` (definido pela coluna, não pelo parâmetro). Para receitas com status diferente, a API realiza uma segunda chamada a `sp_atualizar_status_pagamento` após a inserção.

**Exemplo:**
```sql
CALL sp_registrar_receita(
  'uuid-paciente', 'Sessão de Psicoterapia', 'PIX', 200.00
);
```

---

### `sp_registrar_despesa`

**Objetivo:** Inserir um novo registro de despesa operacional da clínica.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_desc` | VARCHAR | Descrição da despesa |
| `p_cat` | VARCHAR | Categoria (Aluguel, Material, etc.) |
| `p_valor` | DECIMAL | Valor (>= 0) |

**Tabelas afetadas:** `financeiro_despesas`

**Exemplo:**
```sql
CALL sp_registrar_despesa('Aluguel sala clínica', 'Aluguel', 1500.00);
```

---

### `sp_atualizar_status_pagamento`

**Objetivo:** Alterar o status de pagamento de uma receita específica.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_receita_id` | UUID | ID da receita |
| `p_status` | status_pagamento | `pago`, `pendente` ou `cancelado` |

**Tabelas afetadas:** `financeiro_receitas`

**Regra de negócio:** Atualiza apenas registros com `ativo = TRUE`. A trigger `trg_audit_receitas` registra a alteração de status na auditoria. Na chamada via API, o cast explícito `$2::status_pagamento` é necessário para o driver pg reconhecer o tipo ENUM.

**Exemplo:**
```sql
CALL sp_atualizar_status_pagamento('uuid-receita', 'pago'::status_pagamento);
```

---

## Estoque

### `sp_movimentar_estoque`

**Objetivo:** Gerenciar as movimentações de estoque (entrada ou saída) com validação completa antes de alterar o saldo.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_item_id` | UUID | ID do item de estoque |
| `p_tipo` | VARCHAR | `'entrada'` ou `'saida'` |
| `p_qtd` | INT | Quantidade a movimentar (> 0) |
| `p_obs` | TEXT | Observação (opcional) |

**Tabelas afetadas:** `estoque_movimentacoes`, `estoque_itens`

**Regra de negócio — validações em ordem:**
1. Valida se `p_tipo` é `'entrada'` ou `'saida'` — caso contrário lança exceção com mensagem `'Tipo de movimentação inválido...'`.
2. Valida se o item existe e está ativo — caso contrário lança `'Item de estoque não encontrado ou inativo...'`.
3. Para saídas, valida se `quantidade_atual >= p_qtd` — caso contrário lança `'Estoque insuficiente para a saída solicitada...'`.
4. Registra o histórico em `estoque_movimentacoes`.
5. Atualiza `quantidade_atual` em `estoque_itens` (soma para entrada, subtrai para saída).

**Exemplo:**
```sql
CALL sp_movimentar_estoque(
  'uuid-item', 'entrada', 10, 'Reposição mensal de materiais'
);
```

**Observações de segurança:** A API mapeia o erro `'Estoque insuficiente'` para HTTP 409 (Conflict), permitindo que o frontend exiba uma mensagem adequada ao usuário sem expor a mensagem interna do banco.
