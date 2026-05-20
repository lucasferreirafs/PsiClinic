# 10 — Diagrama de Entidade e Relacionamento (DER)

## Descrição

O Diagrama de Entidade e Relacionamento (DER) do PsiClinic representa as 10 tabelas do banco de dados PostgreSQL e seus relacionamentos. O modelo segue os padrões da disciplina de POBD, com foco em integridade referencial via chaves estrangeiras e uso de UUID como identificadores.

**Notação utilizada:** PlantUML (Crow's Foot / IE notation via `||--o{`)

**Como visualizar:**
1. Acesse [https://www.plantuml.com/plantuml/uml/](https://www.plantuml.com/plantuml/uml/)
2. Cole o código abaixo na caixa de texto
3. Clique em "Submit"

Alternativamente, use a extensão **PlantUML** no VS Code com o servidor local ou online.

---

## Código PlantUML

```plantuml
@startuml PsiClinic_DER

skinparam linetype ortho
skinparam entity {
    BackgroundColor #F8F9FA
    BorderColor #6C757D
    FontSize 12
}

entity pacientes {
    *id : UUID <<PK>>
    --
    nome_completo : VARCHAR(150)
    data_nascimento : DATE
    cpf : CHAR(14) <<UNIQUE>>
    telefone : VARCHAR(20)
    email : VARCHAR(100) <<UNIQUE>>
    endereco : TEXT
    profissao : VARCHAR(100)
    estado_civil : VARCHAR(50)
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity contatos_emergencia {
    *id : SERIAL <<PK>>
    --
    paciente_id : UUID <<FK>>
    nome : VARCHAR(150)
    telefone : VARCHAR(20)
    relacao : VARCHAR(50)
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity anamneses {
    *id : UUID <<PK>>
    --
    paciente_id : UUID <<FK>>
    motivo_consulta : TEXT
    tempo_queixa : VARCHAR(50)
    fez_terapia_antes : BOOLEAN
    doencas_fisicas : TEXT
    uso_medicamentos : TEXT
    historico_psiquiatrico : TEXT
    ansiedade : nivel_ansiedade
    objetivo_terapia : TEXT
    observacoes_psicologo : TEXT
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity profissionais {
    *id : UUID <<PK>>
    --
    nome : VARCHAR(150)
    registro_profissional : VARCHAR(50) <<UNIQUE>>
    especialidade : VARCHAR(100)
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity agenda {
    *id : UUID <<PK>>
    --
    data_atendimento : DATE
    hora_atendimento : TIME
    paciente_id : UUID <<FK>>
    profissional_id : UUID <<FK>>
    tipo : tipo_atendimento
    status : status_atendimento
    observacoes : TEXT
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity financeiro_receitas {
    *id : UUID <<PK>>
    --
    data_receita : DATE
    paciente_id : UUID <<FK>>
    servico : VARCHAR(100)
    forma_pagamento : VARCHAR(50)
    valor : DECIMAL(10,2)
    status : status_pagamento
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity financeiro_despesas {
    *id : UUID <<PK>>
    --
    data_despesa : DATE
    descricao : VARCHAR(200)
    categoria : VARCHAR(50)
    valor : DECIMAL(10,2)
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity estoque_itens {
    *id : UUID <<PK>>
    --
    nome_produto : VARCHAR(100)
    categoria : VARCHAR(50)
    quantidade_atual : INT
    quantidade_minima : INT
    fornecedor : VARCHAR(100)
    criado_em : TIMESTAMP
    atualizado_em : TIMESTAMP
    ativo : BOOLEAN
}

entity estoque_movimentacoes {
    *id : UUID <<PK>>
    --
    item_id : UUID <<FK>>
    tipo_movimentacao : VARCHAR(10)
    quantidade : INT
    data_movimentacao : TIMESTAMP
    observacao : TEXT
}

entity auditoria {
    *id : SERIAL <<PK>>
    --
    tabela_afetada : VARCHAR(50)
    operacao : VARCHAR(20)
    dados_anteriores : JSONB
    dados_novos : JSONB
    data_operacao : TIMESTAMP
    usuario : VARCHAR(50)
}

' ─── Relacionamentos ───────────────────────────────────────────

pacientes ||--o{ contatos_emergencia : "tem contatos"
pacientes ||--o{ anamneses : "possui ficha"
pacientes ||--o{ agenda : "agenda consultas"
pacientes ||--o{ financeiro_receitas : "gera receitas"

profissionais ||--o{ agenda : "realiza atendimentos"

estoque_itens ||--o{ estoque_movimentacoes : "registra movimentos"

@enduml
```

---

## Legenda

| Notação | Significado |
|---|---|
| `||--o{` | Um para muitos (1:N) obrigatório no lado "um" |
| `<<PK>>` | Chave primária |
| `<<FK>>` | Chave estrangeira |
| `<<UNIQUE>>` | Restrição de unicidade |
| `UUID` | Identificador universal único (via `uuid_generate_v4()`) |
| `SERIAL` | Inteiro sequencial auto-incremento |
| `BOOLEAN` | Remoção lógica (`ativo`) |
| `JSONB` | JSON binário para snapshots de auditoria |

---

## Notas sobre o Modelo

- A tabela `auditoria` não possui chave estrangeira — ela é populada dinamicamente por triggers via `TG_TABLE_NAME`, capturando qualquer tabela monitorada.
- `financeiro_despesas` não tem FK para `pacientes` pois despesas são operacionais (aluguel, material, etc.) e não vinculadas a um paciente específico.
- `estoque_movimentacoes` não possui `ativo` por ser um log imutável — registros nunca são inativados.
- `agenda` possui dois relacionamentos com tabelas diferentes: um com `pacientes` (quem é atendido) e outro com `profissionais` (quem atende).
