# 01 — Visão Geral do Projeto

## Identificação Acadêmica

| Campo | Valor |
|---|---|
| **Projeto** | PsiClinic — Sistema de Gestão para Clínica de Psicologia |
| **Disciplina** | Programação e Otimização de Banco de Dados (POBD) |
| **Instituição** | UNIBRA — Centro Universitário Brasileiro |
| **Professor** | André Ribeiro |
| **Prazo de entrega** | 03/06/2026 |

---

## Objetivo do Sistema

O **PsiClinic** é um sistema web de gestão clínica desenvolvido para atender os processos operacionais de uma clínica de psicologia. O sistema centraliza o cadastro de pacientes, a gestão de agenda de atendimentos, o controle financeiro, o controle de estoque de materiais e a geração de relatórios gerenciais.

O projeto tem como foco acadêmico demonstrar a aplicação prática de recursos avançados de banco de dados relacional: **Stored Procedures**, **Functions**, **Triggers** e **Views**, todos implementados em PostgreSQL, com integração a uma aplicação web moderna construída em Next.js 15.

---

## Contexto Acadêmico

O sistema foi desenvolvido como projeto final da disciplina de Programação e Otimização de Banco de Dados. O objetivo é evidenciar que a lógica de negócio crítica pode e deve residir no banco de dados, utilizando os recursos nativos do PostgreSQL para garantir:

- **Integridade dos dados** via constraints, checks e triggers.
- **Encapsulamento de regras** via stored procedures.
- **Auditoria automática** via triggers de log centralizado.
- **Performance e legibilidade** via views e functions reutilizáveis.
- **Segurança** ao evitar que a camada de aplicação manipule dados diretamente sem passar por validações do banco.

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| **Framework Web** | Next.js 15 (App Router) |
| **Linguagem** | TypeScript 5.7 |
| **Estilização** | Tailwind CSS 4 |
| **Componentes UI** | Radix UI (Dialog, Select, Tabs, DropdownMenu, etc.) |
| **Gráficos** | Recharts 2.15 |
| **Banco de Dados** | PostgreSQL (hospedado no Supabase) |
| **Driver de Banco** | pg (node-postgres) 8.20 |
| **Gerenciamento de Formulários** | React Hook Form + Zod |
| **Notificações** | Sonner |
| **Ícones** | Lucide React |
| **Hospedagem do Banco** | Supabase (PostgreSQL gerenciado na nuvem) |

---

## Módulos do Sistema

### Módulo 1 — Pacientes e Anamnese
Cadastro completo de pacientes com dados pessoais, contato de emergência e ficha de anamnese inicial. A criação é feita de forma transacional pela stored procedure `sp_registrar_paciente_completo`, garantindo que paciente, contato e anamnese sejam gravados ou revertidos atomicamente.

### Módulo 2 — Agenda de Atendimentos
Gerenciamento do calendário de consultas com suporte a agendamento, confirmação, cancelamento, registro de realização e registro de falta. A validação de conflito de horário é realizada por trigger diretamente no banco, sem necessidade de verificação na aplicação.

### Módulo 3 — Controle Financeiro
Registro de receitas (sessões pagas) e despesas operacionais. O cálculo de lucratividade por período é realizado via function `fn_calcular_lucro_liquido`. O resumo mensal é fornecido pela view `vw_resumo_financeiro_mensal`.

### Módulo 4 — Controle de Estoque
Cadastro de itens de material com controle de quantidade mínima. As movimentações (entrada/saída) são realizadas pela stored procedure `sp_movimentar_estoque`, que valida saldo e registra histórico. A view `vw_lista_estoque_critico` expõe itens abaixo do mínimo.

### Módulo 5 — Relatórios e Dashboards
Painel consolidado com dados financeiros mensais, novos pacientes por mês, distribuição de status da agenda e estado do estoque. Todos os dados são consumidos a partir das views e functions do banco, sem cálculos duplicados na aplicação.

---

## Arquitetura de Banco de Dados

O banco concentra as principais regras de negócio do sistema. A aplicação Next.js atua como camada de apresentação e orquestração, mas **nunca executa INSERT/UPDATE/DELETE diretos** em tabelas de domínio de negócio — toda operação passa pelas stored procedures correspondentes.

| Recurso | Quantidade | Responsabilidade |
|---|---|---|
| **Tabelas** | 10 | Armazenamento persistente com integridade referencial |
| **Stored Procedures** | 12 | Encapsulamento de operações de escrita |
| **Functions** | 6 | Cálculos, validações e callbacks de triggers |
| **Triggers** | 16+ | Auditoria automática, timestamps e validação de conflitos |
| **Views** | 4 | Relatórios e consultas pré-calculadas para o frontend |
| **Tipos ENUM** | 4 | Domínios controlados: status_atendimento, tipo_atendimento, status_pagamento, nivel_ansiedade |

---

## Status Geral do Projeto

| Módulo | Backend (API) | Frontend | Status |
|---|---|---|---|
| Pacientes e Anamnese | Implementado | Integrado | Concluído |
| Agenda de Atendimentos | Implementado | Integrado | Concluído |
| Controle Financeiro | Implementado | Integrado | Concluído |
| Controle de Estoque | Implementado | Integrado | Concluído |
| Relatórios e Dashboards | Implementado | Integrado | Concluído |
| Infraestrutura e Entrega | Em andamento | — | Em andamento |

O build do projeto (`npm run build`) foi executado com sucesso após a implementação de cada módulo, sem erros de TypeScript.
