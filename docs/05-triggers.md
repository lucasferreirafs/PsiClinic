# 05 — Triggers

## Visão Geral

O PsiClinic utiliza triggers para automatizar três categorias de comportamento no banco de dados, sem qualquer dependência da camada de aplicação:

1. **Auditoria centralizada** — qualquer operação de escrita nas tabelas críticas gera um log imutável.
2. **Atualização automática de timestamps** — `atualizado_em` é sempre preciso sem código extra na API.
3. **Validação de integridade de negócio** — conflito de agenda é bloqueado no banco antes do INSERT.

---

## Grupo 1 — Triggers de Auditoria

Todos os triggers deste grupo chamam `fn_auditoria_geral()` e são executados `AFTER` a operação, garantindo que o log só seja gravado se a operação principal for bem-sucedida.

---

### `trg_audit_pacientes`

| Propriedade | Valor |
|---|---|
| **Tabela** | `pacientes` |
| **Evento** | `AFTER INSERT OR UPDATE OR DELETE` |
| **Nível** | `FOR EACH ROW` |
| **Function** | `fn_auditoria_geral()` |

**Objetivo:** Registrar qualquer alteração no cadastro de pacientes, incluindo inativações (UPDATE com `ativo = FALSE`). Permite rastrear quando um paciente foi cadastrado, quais dados foram alterados e quando foi inativado.

**Dados gravados em `auditoria`:**
- `tabela_afetada`: `'pacientes'`
- `operacao`: `'INSERT'`, `'UPDATE'` ou `'DELETE'`
- `dados_anteriores`: snapshot JSON do registro antes da operação (UPDATE/DELETE)
- `dados_novos`: snapshot JSON do registro após a operação (INSERT/UPDATE)

---

### `trg_audit_agenda`

| Propriedade | Valor |
|---|---|
| **Tabela** | `agenda` |
| **Evento** | `AFTER INSERT OR UPDATE OR DELETE` |
| **Nível** | `FOR EACH ROW` |
| **Function** | `fn_auditoria_geral()` |

**Objetivo:** Auditoria completa do ciclo de vida dos agendamentos. Cada mudança de status (`agendado → confirmado → realizado`, cancelamentos, faltas) é registrada com o snapshot antes e depois.

**Benefício:** Permite reconstruir o histórico completo de atendimentos de um paciente ou profissional, mesmo após o registro ser inativado.

---

### `trg_audit_receitas`

| Propriedade | Valor |
|---|---|
| **Tabela** | `financeiro_receitas` |
| **Evento** | `AFTER INSERT OR UPDATE OR DELETE` |
| **Nível** | `FOR EACH ROW` |
| **Function** | `fn_auditoria_geral()` |

**Objetivo:** Registrar todas as operações financeiras de receita. Alterações de status de pagamento (`pendente → pago`) ficam registradas com timestamp e dados anteriores, criando uma trilha financeira confiável.

**Benefício crítico:** Em sistemas financeiros, a auditoria é obrigatória para conformidade. Qualquer estorno, cancelamento ou alteração de valor pode ser rastreado.

---

### `trg_audit_despesas`

| Propriedade | Valor |
|---|---|
| **Tabela** | `financeiro_despesas` |
| **Evento** | `AFTER INSERT OR UPDATE OR DELETE` |
| **Nível** | `FOR EACH ROW` |
| **Function** | `fn_auditoria_geral()` |

**Objetivo:** Auditoria das despesas operacionais. Inativações e eventuais correções de valor ficam registradas.

---

## Grupo 2 — Triggers de Atualização de Timestamp

Este grupo é criado dinamicamente via bloco `DO $$` que itera por todas as tabelas públicas, exceto `auditoria` e `estoque_movimentacoes` (que são tabelas de log imutável).

```sql
DO $$
DECLARE t TEXT;
BEGIN
    FOR t IN (
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name NOT IN ('auditoria', 'estoque_movimentacoes')
    )
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_upd_timestamp_%I BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp()',
            t, t
        );
    END LOOP;
END $$;
```

**Triggers criados automaticamente:**

| Trigger | Tabela |
|---|---|
| `trg_upd_timestamp_pacientes` | `pacientes` |
| `trg_upd_timestamp_contatos_emergencia` | `contatos_emergencia` |
| `trg_upd_timestamp_anamneses` | `anamneses` |
| `trg_upd_timestamp_profissionais` | `profissionais` |
| `trg_upd_timestamp_agenda` | `agenda` |
| `trg_upd_timestamp_financeiro_receitas` | `financeiro_receitas` |
| `trg_upd_timestamp_financeiro_despesas` | `financeiro_despesas` |
| `trg_upd_timestamp_estoque_itens` | `estoque_itens` |

**Evento:** `BEFORE UPDATE FOR EACH ROW`

**Function:** `fn_atualizar_timestamp()`

**Objetivo:** Garantir que o campo `atualizado_em` seja sempre atualizado para `CURRENT_TIMESTAMP` em qualquer UPDATE, independentemente de qual coluna foi modificada ou de qual ferramenta realizou a alteração.

**Por que BEFORE e não AFTER:**  O trigger `BEFORE UPDATE` pode modificar `NEW` antes de persistir. Com `AFTER`, a linha já foi gravada e não é possível ajustar o valor. Portanto, o uso de `BEFORE` é a abordagem correta para auto-atualização de campos.

---

## Grupo 3 — Trigger de Validação de Agenda

### `trg_verificar_agenda`

| Propriedade | Valor |
|---|---|
| **Tabela** | `agenda` |
| **Evento** | `BEFORE INSERT OR UPDATE` |
| **Nível** | `FOR EACH ROW` |
| **Function** | `fn_validar_conflito_agenda()` |

**Objetivo:** Bloquear a criação ou atualização de um agendamento que geraria conflito de horário para o mesmo profissional na mesma data e hora.

**Lógica de validação:**
- Verifica se já existe outro agendamento com o mesmo `profissional_id`, `data_atendimento` e `hora_atendimento`.
- Considera apenas registros `ativo = TRUE` e com status diferente de `'cancelado'` (agendamentos cancelados não bloqueiam o horário).
- A condição `id != NEW.id` permite que um UPDATE no próprio agendamento (ex: alterar o tipo de presencial para online) não seja barrado.
- Se conflito existir: lança `RAISE EXCEPTION`, abortando toda a transação.

**Por que BEFORE e não AFTER:** Um trigger `AFTER INSERT` seria tarde demais — o registro já teria sido inserido. Com `BEFORE INSERT`, a validação ocorre antes da persistência, e o RAISE EXCEPTION cancela a operação sem deixar rastros inválidos.

**Integração com a API:** A rota `POST /api/agenda` captura mensagens de erro que contêm `'Conflito de agenda'` e retorna HTTP 409, que o frontend exibe como toast de aviso ao usuário.

---

## Resumo dos Triggers

| Trigger | Tabela | Evento | Timing | Function |
|---|---|---|---|---|
| `trg_audit_pacientes` | `pacientes` | INSERT OR UPDATE OR DELETE | AFTER | `fn_auditoria_geral` |
| `trg_audit_agenda` | `agenda` | INSERT OR UPDATE OR DELETE | AFTER | `fn_auditoria_geral` |
| `trg_audit_receitas` | `financeiro_receitas` | INSERT OR UPDATE OR DELETE | AFTER | `fn_auditoria_geral` |
| `trg_audit_despesas` | `financeiro_despesas` | INSERT OR UPDATE OR DELETE | AFTER | `fn_auditoria_geral` |
| `trg_upd_timestamp_*` | Múltiplas | UPDATE | BEFORE | `fn_atualizar_timestamp` |
| `trg_verificar_agenda` | `agenda` | INSERT OR UPDATE | BEFORE | `fn_validar_conflito_agenda` |
