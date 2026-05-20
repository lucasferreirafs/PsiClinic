# 04 — Functions

## Visão Geral

O PsiClinic utiliza **6 functions** PL/pgSQL que servem dois propósitos distintos:

1. **Functions de negócio:** Encapsulam cálculos e validações reutilizáveis, chamadas diretamente pela aplicação ou por stored procedures.
2. **Functions de trigger:** São funções especiais com retorno `TRIGGER`, executadas automaticamente pelos triggers definidos no schema.

---

## Functions de Negócio

### `fn_calcular_idade`

**Objetivo:** Calcular a idade atual de uma pessoa a partir da data de nascimento, retornando um inteiro com o número de anos completos.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_data_nascimento` | DATE | Data de nascimento do paciente |

**Retorno:** `INT` — Idade em anos completos.

**Onde é usada:**
- Diretamente na definição da view `vw_pacientes_ativos` (coluna `idade`).
- Indiretamente na API `GET /api/pacientes` e na aba de Relatórios (estatísticas de pacientes).

**Regra de negócio:** Utiliza `EXTRACT(YEAR FROM age(CURRENT_DATE, p_data_nascimento))`, que considera corretamente o mês e o dia para não contar aniversários antecipadamente.

**Exemplo de uso:**
```sql
SELECT fn_calcular_idade('1990-05-15');
-- Retorna: 35 (em 2026)
```

**Por que é uma function e não uma coluna:** A idade muda com o tempo sem necessidade de atualização no banco. Computar em tempo real garante que sempre retorne o valor correto.

---

### `fn_calcular_lucro_liquido`

**Objetivo:** Calcular o lucro líquido de um período específico, subtraindo o total de despesas do total de receitas efetivamente pagas no intervalo informado.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_data_inicio` | DATE | Início do período |
| `p_data_fim` | DATE | Fim do período |

**Retorno:** `DECIMAL(10,2)` — Valor do lucro líquido (pode ser negativo em caso de prejuízo).

**Onde é usada:**
- Rota `GET /api/financeiro/lucro?dataInicio=&dataFim=`.
- Rota `GET /api/relatorios/resumo` (card de lucro do período filtrado).

**Regra de negócio:**
- Soma apenas receitas com `status = 'pago'` e `ativo = TRUE` no período.
- Soma todas as despesas com `ativo = TRUE` no período.
- Usa `COALESCE(SUM(...), 0)` para retornar 0 em vez de NULL quando não há registros no período.

**Exemplo de uso:**
```sql
SELECT fn_calcular_lucro_liquido('2026-01-01', '2026-03-31') AS lucro;
-- Retorna: 4500.00
```

---

### `fn_verificar_status_estoque`

**Objetivo:** Retornar o status atual de um item de estoque com base na comparação entre `quantidade_atual` e `quantidade_minima`.

**Parâmetros:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `p_item_id` | UUID | ID do item em `estoque_itens` |

**Retorno:** `VARCHAR(20)` — Um dos valores: `'CRÍTICO'`, `'NORMAL'` ou `'INEXISTENTE'`.

**Onde é usada:**
- Rota `GET /api/estoque` — coluna `status_estoque` retornada para cada item.
- Rota `GET /api/relatorios/estoque` — contagem de itens críticos no resumo.

**Regra de negócio:**
- Se o item não for encontrado ou estiver inativo: retorna `'INEXISTENTE'`.
- Se `quantidade_atual < quantidade_minima`: retorna `'CRÍTICO'`.
- Caso contrário: retorna `'NORMAL'`.

**Exemplo de uso:**
```sql
SELECT fn_verificar_status_estoque('uuid-item') AS status;
-- Retorna: 'CRÍTICO'
```

**Benefício:** O frontend pode exibir badges de cor diferente baseados neste valor sem precisar comparar os dois campos manualmente.

---

## Functions de Trigger

Functions com retorno `TRIGGER` não são chamadas diretamente — são executadas automaticamente pelos triggers definidos no schema.

---

### `fn_atualizar_timestamp`

**Objetivo:** Atualizar automaticamente o campo `atualizado_em` para o timestamp atual sempre que um registro for modificado.

**Parâmetros:** Nenhum (recebe contexto via variável especial `NEW` do trigger).

**Retorno:** `TRIGGER`

**Onde é usada:** Associada a todos os triggers `trg_upd_timestamp_*`, criados dinamicamente via bloco `DO $$` para todas as tabelas públicas que não são `auditoria` e `estoque_movimentacoes`.

**Regra de negócio:** Atribui `NEW.atualizado_em = CURRENT_TIMESTAMP` antes de persistir o UPDATE, garantindo que o campo de rastreamento seja sempre preciso sem depender da aplicação.

**Exemplo de efeito:**
```sql
UPDATE pacientes SET nome_completo = 'Maria Souza' WHERE id = 'uuid';
-- atualizado_em é automaticamente atualizado para NOW()
```

---

### `fn_auditoria_geral`

**Objetivo:** Registrar na tabela `auditoria` um snapshot JSON do registro afetado a cada operação de INSERT, UPDATE ou DELETE nas tabelas monitoradas.

**Parâmetros:** Nenhum (recebe contexto via `OLD` e `NEW` do trigger, e `TG_OP`, `TG_TABLE_NAME`).

**Retorno:** `TRIGGER`

**Onde é usada:** Associada aos triggers:
- `trg_audit_receitas` — tabela `financeiro_receitas`
- `trg_audit_despesas` — tabela `financeiro_despesas`
- `trg_audit_agenda` — tabela `agenda`
- `trg_audit_pacientes` — tabela `pacientes`

**Regra de negócio por operação:**
- `DELETE`: grava `dados_anteriores = to_jsonb(OLD)`, `dados_novos = NULL`.
- `UPDATE`: grava `dados_anteriores = to_jsonb(OLD)`, `dados_novos = to_jsonb(NEW)`.
- `INSERT`: grava `dados_anteriores = NULL`, `dados_novos = to_jsonb(NEW)`.

O uso de `to_jsonb()` garante que o snapshot seja uma fotografia completa e tipada do registro no momento da operação.

**Exemplo de registro gerado:**
```sql
SELECT * FROM auditoria ORDER BY data_operacao DESC LIMIT 1;
-- tabela_afetada: 'financeiro_receitas'
-- operacao: 'UPDATE'
-- dados_anteriores: {"id": "...", "status": "pendente", ...}
-- dados_novos: {"id": "...", "status": "pago", ...}
```

---

### `fn_validar_conflito_agenda`

**Objetivo:** Impedir o cadastro de dois atendimentos para o mesmo profissional no mesmo horário, garantindo integridade do calendário no nível do banco de dados.

**Parâmetros:** Nenhum (recebe `NEW` com os dados do agendamento sendo inserido/atualizado).

**Retorno:** `TRIGGER`

**Onde é usada:** Associada ao trigger `trg_verificar_agenda` (BEFORE INSERT OR UPDATE) na tabela `agenda`.

**Regra de negócio:**
```sql
IF EXISTS (
    SELECT 1 FROM agenda
    WHERE profissional_id = NEW.profissional_id
    AND data_atendimento = NEW.data_atendimento
    AND hora_atendimento = NEW.hora_atendimento
    AND id != NEW.id          -- exclui o próprio registro em caso de UPDATE
    AND ativo = TRUE
    AND status NOT IN ('cancelado')
) THEN
    RAISE EXCEPTION 'Conflito de agenda: O profissional já possui atendimento ativo neste horário.';
END IF;
```

A condição `id != NEW.id` é essencial para permitir que um UPDATE no próprio registro não seja barrado pela sua própria existência.

**Benefício:** A validação ocorre no banco, garantindo consistência mesmo que outra aplicação ou acesso direto tente criar um conflito, não apenas via a API Next.js.
