# Documentação do Estado Atual do Projeto - Clínica de Psicologia (PsiClinic)

Esta documentação descreve o estado atual do projeto para a disciplina de **Programação e Otimização de Banco de Dados** (UNIBRA), sob a orientação do Prof. André Ribeiro.

---

## 1. Visão Geral do Projeto
- **Curso:** Análise e Desenvolvimento de Sistemas
- **Disciplina:** Programação e Otimização de Banco de Dados (POBD)
- **Tema:** Clínica de Psicologia
- **Prazo de Entrega:** 03/06/2026
- **Status Geral:** 🚀 **Em Integração de Banco de Dados**

---

## 2. Status de Implementação por Camada

### 2.1. Frontend (Interface)
- **Status:** ✅ 100% (Protótipo Funcional)
- **Módulos Prontos:** Anamnese, Agenda, Financeiro, Estoque, Relatórios, Pacientes e Usuários.
- **Tecnologias:** Next.js 15, Tailwind CSS, Radix UI, Recharts.

### 2.2. Banco de Dados (PostgreSQL + Supabase)
- **Status:** ✅ 90% (Schema e Lógica Prontos)
- **Implementado:** 
    - Modelagem de tabelas (Pacientes, Anamnese, Agenda, Financeiro, Estoque).
    - **Stored Procedures:** CRUD encapsulado para todas as operações críticas.
    - **Functions:** Lógica de idade, lucro líquido e status de estoque.
    - **Triggers:** Auditoria automática, controle de horários e auto-update de timestamps.
    - **Views:** Consultas estruturadas para relatórios e dashboards.

### 2.3. Integração (Backend / API)
- **Status:** 🟡 10% (Iniciado)
- **Implementado:**
    - Configuração da Pool de Conexão em `src/lib/db.ts`.
    - Variáveis de ambiente (`DATABASE_URL`) configuradas.
    - Rota de teste `api/test-db` validada e funcional.

---

## 3. Conformidade com os Critérios Técnicos (PDF)

| Requisito do PDF | Status Atual | Observação |
| :--- | :---: | :--- |
| **Modelagem Estrutural do BD** | ✅ Concluído | Schema finalizado e aplicado no Supabase. |
| **Stored Procedures (CRUD)** | ✅ Concluído | Todas as operações críticas possuem procedures. |
| **Functions (Cálculos/Lógica)** | ✅ Concluído | Lógica de negócio processada no banco. |
| **Triggers (Integridade/Regras)** | ✅ Concluído | Auditoria e regras de agenda automatizadas. |
| **Views (Relatórios)** | ✅ Concluído | Views prontas para alimentar os gráficos. |
| **Interface de Anamnese** | ✅ Concluído | Design finalizado conforme o PDF. |
| **Agenda de Atendimentos** | ✅ Concluído | Estrutura de tabela e status implementados. |
| **Controle Financeiro** | ✅ Concluído | Entradas, Saídas e Resumo Mensal ok. |
| **Controle de Estoque** | ✅ Concluído | Estrutura de ID, Nome, Qtd, etc. ok. |
| **Versionamento via GitHub** | ⚠️ Em andamento | Projeto versionado localmente. |
| **Deploy (Supabase/Railway)** | ✅ Concluído | Banco de Dados já está online no Supabase. |

---

## 4. Próximos Passos (Dívida Técnica de Integração)

As tarefas detalhadas para a conclusão do projeto encontram-se no arquivo **[BACKLOG.md](./BACKLOG.md)** na raiz do projeto. O foco imediato é:

1. Criar as rotas de API para cada módulo.
2. Substituir o `useState` com dados fictícios por chamadas `fetch` às APIs reais.
3. Gerar a documentação final em PDF para submissão.

---
*Documentação atualizada em 16 de Maio de 2026.*
