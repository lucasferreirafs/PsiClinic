# 02 — Modelagem do Banco de Dados

## Visão Geral do Modelo

O banco de dados do PsiClinic é um modelo relacional normalizado em PostgreSQL. O modelo foi projetado para suportar as operações clínicas da aplicação com segurança, rastreabilidade e integridade referencial.

Todas as tabelas de domínio utilizam:
- **UUID** como chave primária (via extensão `uuid-ossp`), evitando IDs sequenciais previsíveis.
- **`ativo BOOLEAN DEFAULT TRUE`** para remoção lógica, preservando o histórico de dados.
- **`criado_em TIMESTAMP`** para rastrear a data de criação do registro.
- **`atualizado_em TIMESTAMP`** atualizado automaticamente por triggers `BEFORE UPDATE`.

---

## Tipos Enumerados (ENUM)

Antes das tabelas, o schema define quatro domínios controlados que garantem valores válidos em colunas críticas:

| Tipo | Valores Possíveis |
|---|---|
| `status_atendimento` | `agendado`, `confirmado`, `realizado`, `cancelado`, `faltou` |
| `tipo_atendimento` | `presencial`, `online` |
| `status_pagamento` | `pago`, `pendente`, `cancelado` |
| `nivel_ansiedade` | `leve`, `moderada`, `intensa` |

---

## Tabelas

### `auditoria`

**Finalidade:** Log centralizado de todas as operações de INSERT, UPDATE e DELETE realizadas nas tabelas de domínio. Funciona como trilha de auditoria do sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | Chave primária sequencial |
| `tabela_afetada` | VARCHAR(50) | Nome da tabela onde ocorreu a operação |
| `operacao` | VARCHAR(20) | Tipo da operação: INSERT, UPDATE, DELETE |
| `dados_anteriores` | JSONB | Snapshot do registro antes da operação (UPDATE/DELETE) |
| `dados_novos` | JSONB | Snapshot do registro após a operação (INSERT/UPDATE) |
| `data_operacao` | TIMESTAMP | Momento do registro, padrão `CURRENT_TIMESTAMP` |
| `usuario` | VARCHAR(50) | Usuário do banco que executou, padrão `CURRENT_USER` |

**Chave primária:** `id` (SERIAL)
**Observações:** Não possui `ativo` nem `atualizado_em`, pois logs de auditoria são imutáveis. Populada exclusivamente pela função `fn_auditoria_geral` via triggers.

---

### `pacientes`

**Finalidade:** Cadastro base de todos os pacientes da clínica. É a entidade central do modelo, referenciada por quase todas as demais tabelas.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária, gerada por `uuid_generate_v4()` |
| `nome_completo` | VARCHAR(150) | Nome completo — obrigatório |
| `data_nascimento` | DATE | Data de nascimento — obrigatório |
| `cpf` | CHAR(14) | CPF com máscara — único e obrigatório |
| `telefone` | VARCHAR(20) | Telefone de contato — obrigatório |
| `email` | VARCHAR(100) | E-mail — único e obrigatório |
| `endereco` | TEXT | Endereço completo — opcional |
| `profissao` | VARCHAR(100) | Profissão — opcional |
| `estado_civil` | VARCHAR(50) | Estado civil — opcional |
| `criado_em` | TIMESTAMP | Data de cadastro |
| `atualizado_em` | TIMESTAMP | Data da última atualização (automático via trigger) |
| `ativo` | BOOLEAN | Remoção lógica, padrão `TRUE` |

**Chave primária:** `id` (UUID)
**Relacionamentos:** 1:N com `contatos_emergencia`, `anamneses`, `agenda`, `financeiro_receitas`
**Observações:** CPF e e-mail possuem constraint UNIQUE. A idade não é armazenada — é calculada em tempo real pela function `fn_calcular_idade`.

---

### `contatos_emergencia`

**Finalidade:** Armazena o contato de emergência de cada paciente, vinculado por chave estrangeira.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL | Chave primária sequencial |
| `paciente_id` | UUID | FK para `pacientes.id` — ON DELETE RESTRICT |
| `nome` | VARCHAR(150) | Nome do contato — obrigatório |
| `telefone` | VARCHAR(20) | Telefone — obrigatório |
| `relacao` | VARCHAR(50) | Grau de parentesco/relação — obrigatório |
| `criado_em` | TIMESTAMP | Data de cadastro |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (SERIAL)
**Relacionamentos:** N:1 com `pacientes`
**Observações:** `ON DELETE RESTRICT` impede exclusão de paciente com contato cadastrado. Cadastrado transacionalmente via `sp_registrar_paciente_completo`.

---

### `anamneses`

**Finalidade:** Ficha de anamnese técnica do paciente. Contém informações clínicas detalhadas coletadas na primeira consulta e atualizáveis pelo psicólogo ao longo do acompanhamento.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `paciente_id` | UUID | FK para `pacientes.id` |
| `motivo_consulta` | TEXT | Queixa principal — obrigatório |
| `tempo_queixa` | VARCHAR(50) | Duração da queixa — opcional |
| `fez_terapia_antes` | BOOLEAN | Histórico de terapia prévia |
| `doencas_fisicas` | TEXT | Condições físicas relevantes |
| `uso_medicamentos` | TEXT | Medicamentos em uso |
| `historico_psiquiatrico` | TEXT | Histórico de tratamentos psiquiátricos |
| `ansiedade` | nivel_ansiedade | Nível de ansiedade (ENUM: leve/moderada/intensa) |
| `objetivo_terapia` | TEXT | Meta terapêutica declarada |
| `observacoes_psicologo` | TEXT | Notas do profissional |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Relacionamentos:** N:1 com `pacientes`
**Observações:** Criada automaticamente junto ao paciente via `sp_registrar_paciente_completo`. Atualizada pelo psicólogo via `sp_atualizar_anamnese`.

---

### `profissionais`

**Finalidade:** Cadastro dos psicólogos e profissionais de saúde que realizam atendimentos na clínica.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `nome` | VARCHAR(150) | Nome do profissional — obrigatório |
| `registro_profissional` | VARCHAR(50) | CRP ou registro — único |
| `especialidade` | VARCHAR(100) | Área de atuação |
| `criado_em` | TIMESTAMP | Data de cadastro |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Relacionamentos:** 1:N com `agenda`
**Observações:** `registro_profissional` possui constraint UNIQUE.

---

### `agenda`

**Finalidade:** Registro de todos os agendamentos de consulta da clínica, com controle de status do ciclo de vida do atendimento.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `data_atendimento` | DATE | Data da consulta — obrigatório |
| `hora_atendimento` | TIME | Horário — obrigatório |
| `paciente_id` | UUID | FK para `pacientes.id` |
| `profissional_id` | UUID | FK para `profissionais.id` |
| `tipo` | tipo_atendimento | presencial ou online (ENUM) |
| `status` | status_atendimento | Ciclo de vida: agendado → confirmado → realizado/cancelado/faltou |
| `observacoes` | TEXT | Notas do agendamento |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Relacionamentos:** N:1 com `pacientes` e `profissionais`
**Observações:** A trigger `trg_verificar_agenda` valida conflito de horário (mesmo profissional, mesma data/hora) antes de INSERT ou UPDATE.

---

### `financeiro_receitas`

**Finalidade:** Registro de todas as entradas financeiras da clínica, tipicamente pagamentos de sessões.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `data_receita` | DATE | Data do recebimento, padrão `CURRENT_DATE` |
| `paciente_id` | UUID | FK para `pacientes.id` |
| `servico` | VARCHAR(100) | Descrição do serviço prestado — obrigatório |
| `forma_pagamento` | VARCHAR(50) | PIX, Cartão, Dinheiro, etc. |
| `valor` | DECIMAL(10,2) | Valor — obrigatório, CHECK >= 0 |
| `status` | status_pagamento | pago, pendente, cancelado (ENUM) |
| `criado_em` | TIMESTAMP | Data de registro |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Relacionamentos:** N:1 com `pacientes`
**Observações:** Registrada via `sp_registrar_receita`. Status atualizado via `sp_atualizar_status_pagamento`. A view `vw_resumo_financeiro_mensal` considera apenas receitas com `status = 'pago'`.

---

### `financeiro_despesas`

**Finalidade:** Registro de saídas financeiras operacionais da clínica (aluguel, materiais, serviços, etc.).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `data_despesa` | DATE | Data da despesa, padrão `CURRENT_DATE` |
| `descricao` | VARCHAR(200) | Descrição — obrigatório |
| `categoria` | VARCHAR(50) | Categoria (Aluguel, Material, etc.) |
| `valor` | DECIMAL(10,2) | Valor — obrigatório, CHECK >= 0 |
| `criado_em` | TIMESTAMP | Data de registro |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Observações:** Registrada via `sp_registrar_despesa`. Não há vínculo direto com paciente, pois despesas são operacionais.

---

### `estoque_itens`

**Finalidade:** Catálogo de materiais e insumos da clínica com controle de saldo atual e quantidade mínima de alerta.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `nome_produto` | VARCHAR(100) | Nome do item — obrigatório |
| `categoria` | VARCHAR(50) | Categoria do material |
| `quantidade_atual` | INT | Saldo atual, CHECK >= 0, padrão 0 |
| `quantidade_minima` | INT | Limite de alerta, CHECK >= 0, padrão 5 |
| `fornecedor` | VARCHAR(100) | Nome do fornecedor |
| `criado_em` | TIMESTAMP | Data de cadastro |
| `atualizado_em` | TIMESTAMP | Atualizado automaticamente |
| `ativo` | BOOLEAN | Remoção lógica |

**Chave primária:** `id` (UUID)
**Relacionamentos:** 1:N com `estoque_movimentacoes`
**Observações:** `quantidade_atual` nunca é alterado diretamente — sempre via `sp_movimentar_estoque`. O status crítico é calculado por `fn_verificar_status_estoque`.

---

### `estoque_movimentacoes`

**Finalidade:** Histórico imutável de todas as movimentações de estoque (entradas e saídas), servindo como log financeiro do almoxarifado.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária |
| `item_id` | UUID | FK para `estoque_itens.id` — ON DELETE RESTRICT |
| `tipo_movimentacao` | VARCHAR(10) | `entrada` ou `saida`, CHECK com valores válidos |
| `quantidade` | INT | Quantidade movimentada — obrigatório, CHECK > 0 |
| `data_movimentacao` | TIMESTAMP | Momento da movimentação, padrão `CURRENT_TIMESTAMP` |
| `observacao` | TEXT | Justificativa ou nota da movimentação |

**Chave primária:** `id` (UUID)
**Relacionamentos:** N:1 com `estoque_itens`
**Observações:** Não possui `ativo` nem `atualizado_em` — registros são imutáveis. Populada exclusivamente por `sp_movimentar_estoque`.

---

## Padrões Globais de Projeto

### UUID como Chave Primária
Todas as tabelas de domínio usam `UUID DEFAULT uuid_generate_v4()`. Isso evita IDs previsíveis, facilita integração com sistemas externos e é compatível com o padrão da extensão `uuid-ossp`.

### Remoção Lógica (`ativo`)
Nenhum registro de negócio é deletado fisicamente. O campo `ativo BOOLEAN DEFAULT TRUE` é marcado como `FALSE` para inativar registros, preservando o histórico para relatórios e auditoria.

### Timestamps Automáticos
`criado_em` registra o momento da inserção (padrão `CURRENT_TIMESTAMP`). `atualizado_em` é atualizado automaticamente por triggers `BEFORE UPDATE` via `fn_atualizar_timestamp`, sem necessidade de controle na aplicação.

### Integridade Referencial
Todas as chaves estrangeiras usam `ON DELETE RESTRICT`, impedindo exclusão de registros pai que possuam filhos ativos, forçando o uso de remoção lógica.
