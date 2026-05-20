# 06 — Views

## Visão Geral

O PsiClinic utiliza **4 views** SQL que pré-calculam e consolidam dados para consumo direto pela camada de API, eliminando queries complexas repetidas e garantindo consistência nos relatórios.

As views servem como a "camada de leitura" do sistema: enquanto as stored procedures controlam as escritas, as views controlam as leituras de forma segura e centralizada.

---

## `vw_pacientes_ativos`

**Objetivo:** Fornecer a lista de pacientes ativos com a idade calculada em tempo real, sem necessidade de filtros adicionais na aplicação.

**Definição:**
```sql
CREATE VIEW vw_pacientes_ativos AS
SELECT
    id,
    nome_completo,
    email,
    telefone,
    fn_calcular_idade(data_nascimento) AS idade
FROM pacientes
WHERE ativo = TRUE;
```

**Campos retornados:**

| Campo | Tipo | Origem |
|---|---|---|
| `id` | UUID | `pacientes.id` |
| `nome_completo` | VARCHAR | `pacientes.nome_completo` |
| `email` | VARCHAR | `pacientes.email` |
| `telefone` | VARCHAR | `pacientes.telefone` |
| `idade` | INT | Calculado por `fn_calcular_idade(data_nascimento)` |

**Tabelas envolvidas:** `pacientes`

**Onde é usada no sistema:**
- `GET /api/pacientes` — listagem do módulo de Pacientes.
- `GET /api/relatorios/pacientes` — estatísticas (COUNT, AVG, MIN, MAX de idade).
- `GET /api/relatorios/resumo` — card de total de pacientes ativos.

**Exemplo de uso:**
```sql
SELECT * FROM vw_pacientes_ativos ORDER BY nome_completo ASC;
```

**Observação:** A view não inclui todos os campos do paciente (ex: CPF, endereço) por design de segurança — campos sensíveis são retornados apenas em consultas com `WHERE p.id = $1` diretamente na tabela `pacientes`.

---

## `vw_agenda_diaria`

**Objetivo:** Fornecer os atendimentos do dia atual com dados desnormalizados (nomes de paciente e profissional já resolvidos), prontos para exibição na interface.

**Definição:**
```sql
CREATE VIEW vw_agenda_diaria AS
SELECT
    a.hora_atendimento,
    p.nome_completo AS paciente,
    prof.nome AS profissional,
    a.tipo,
    a.status
FROM agenda a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais prof ON a.profissional_id = prof.id
WHERE a.data_atendimento = CURRENT_DATE
  AND a.ativo = TRUE
ORDER BY a.hora_atendimento;
```

**Campos retornados:**

| Campo | Tipo | Origem |
|---|---|---|
| `hora_atendimento` | TIME | `agenda.hora_atendimento` |
| `paciente` | VARCHAR | `pacientes.nome_completo` |
| `profissional` | VARCHAR | `profissionais.nome` |
| `tipo` | tipo_atendimento | `agenda.tipo` |
| `status` | status_atendimento | `agenda.status` |

**Tabelas envolvidas:** `agenda`, `pacientes`, `profissionais`

**Onde é usada no sistema:**
- `GET /api/agenda/diaria` — lista de atendimentos do dia no módulo de Agenda.
- `GET /api/relatorios/agenda` — tabela de agenda diária na aba de Relatórios.
- `GET /api/relatorios/resumo` — card de consultas do dia.

**Exemplo de uso:**
```sql
SELECT * FROM vw_agenda_diaria;
-- Retorna apenas os atendimentos de CURRENT_DATE
```

**Observação:** O filtro `data_atendimento = CURRENT_DATE` é aplicado diretamente na view. Para relatórios históricos, as queries de relatório consultam a tabela `agenda` diretamente com parâmetros de data.

---

## `vw_resumo_financeiro_mensal`

**Objetivo:** Consolidar receitas e despesas por mês/ano em uma única linha por período, calculando o lucro líquido de cada mês. Serve como fonte principal dos gráficos financeiros.

**Definição:**
```sql
CREATE VIEW vw_resumo_financeiro_mensal AS
WITH receitas AS (
    SELECT
        EXTRACT(YEAR FROM data_receita) AS ano,
        EXTRACT(MONTH FROM data_receita) AS mes,
        SUM(valor) AS total_receitas
    FROM financeiro_receitas
    WHERE status = 'pago' AND ativo = TRUE
    GROUP BY 1, 2
),
despesas AS (
    SELECT
        EXTRACT(YEAR FROM data_despesa) AS ano,
        EXTRACT(MONTH FROM data_despesa) AS mes,
        SUM(valor) AS total_despesas
    FROM financeiro_despesas
    WHERE ativo = TRUE
    GROUP BY 1, 2
)
SELECT
    COALESCE(r.ano, d.ano) AS ano,
    COALESCE(r.mes, d.mes) AS mes,
    COALESCE(r.total_receitas, 0) AS total_receitas,
    COALESCE(d.total_despesas, 0) AS total_despesas,
    (COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0)) AS lucro_liquido
FROM receitas r
FULL OUTER JOIN despesas d ON r.ano = d.ano AND r.mes = d.mes;
```

**Campos retornados:**

| Campo | Tipo | Descrição |
|---|---|---|
| `ano` | NUMERIC | Ano (ex: 2026) |
| `mes` | NUMERIC | Mês numérico (1–12) |
| `total_receitas` | DECIMAL | Soma das receitas pagas no mês |
| `total_despesas` | DECIMAL | Soma das despesas no mês |
| `lucro_liquido` | DECIMAL | `total_receitas - total_despesas` |

**Tabelas envolvidas:** `financeiro_receitas`, `financeiro_despesas`

**Onde é usada no sistema:**
- `GET /api/financeiro/resumo` — dados do gráfico de evolução financeira.
- `GET /api/relatorios/financeiro` — fonte completa para os gráficos da aba Financeiro nos Relatórios.
- `GET /api/relatorios/resumo` — último mês do resumo para o card de faturamento.

**Exemplo de uso:**
```sql
SELECT * FROM vw_resumo_financeiro_mensal
ORDER BY ano ASC, mes ASC;
```

**Observações:**
- O `FULL OUTER JOIN` garante que meses com apenas receitas ou apenas despesas apareçam na listagem.
- `COALESCE(..., 0)` evita NULL nas colunas numéricas, simplificando o tratamento na aplicação.
- Considera apenas receitas com `status = 'pago'`, excluindo pendentes e canceladas do cálculo de lucro.

---

## `vw_lista_estoque_critico`

**Objetivo:** Expor os itens de estoque cujo saldo atual está abaixo da quantidade mínima configurada, servindo como alerta operacional para reposição.

**Definição:**
```sql
CREATE VIEW vw_lista_estoque_critico AS
SELECT
    nome_produto,
    quantidade_atual,
    quantidade_minima,
    fornecedor
FROM estoque_itens
WHERE quantidade_atual < quantidade_minima
  AND ativo = TRUE;
```

**Campos retornados:**

| Campo | Tipo | Descrição |
|---|---|---|
| `nome_produto` | VARCHAR | Nome do item |
| `quantidade_atual` | INT | Saldo atual em estoque |
| `quantidade_minima` | INT | Limite configurado para alerta |
| `fornecedor` | VARCHAR | Nome do fornecedor para contato |

**Tabelas envolvidas:** `estoque_itens`

**Onde é usada no sistema:**
- `GET /api/estoque/critico` — lista do banner de alertas no módulo de Estoque.
- `GET /api/relatorios/estoque` — tabela de itens críticos na aba Estoque dos Relatórios.
- `GET /api/relatorios/resumo` — contagem de itens críticos para o card de resumo.

**Exemplo de uso:**
```sql
SELECT * FROM vw_lista_estoque_critico ORDER BY nome_produto ASC;
```

**Observação:** A view é complementada pela function `fn_verificar_status_estoque`, que retorna `'CRÍTICO'` ou `'NORMAL'` para um item específico por UUID. A view é usada para listagens; a function é usada para status por item.
