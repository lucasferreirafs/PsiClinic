# 09 — Checklist de Entrega Final

**Projeto:** PsiClinic — Sistema de Gestão para Clínica de Psicologia
**Disciplina:** POBD — UNIBRA
**Prazo:** 03/06/2026

---

## Banco de Dados

- [x] Schema aplicado com sucesso no Supabase
- [x] Extensão `uuid-ossp` habilitada
- [x] Tipos ENUM criados (`status_atendimento`, `tipo_atendimento`, `status_pagamento`, `nivel_ansiedade`)
- [x] Tabela `auditoria` criada
- [x] Tabela `pacientes` criada
- [x] Tabela `contatos_emergencia` criada
- [x] Tabela `anamneses` criada
- [x] Tabela `profissionais` criada
- [x] Tabela `agenda` criada
- [x] Tabela `financeiro_receitas` criada
- [x] Tabela `financeiro_despesas` criada
- [x] Tabela `estoque_itens` criada
- [x] Tabela `estoque_movimentacoes` criada
- [x] Stored Procedure `sp_registrar_paciente_completo` criada
- [x] Stored Procedure `sp_atualizar_anamnese` criada
- [x] Stored Procedure `sp_atualizar_anamnese_completa` criada (patch incremental)
- [x] Stored Procedure `sp_atualizar_paciente_completo` criada (patch incremental)
- [x] Stored Procedure `sp_agendar_atendimento` criada
- [x] Stored Procedure `sp_atualizar_status_atendimento` criada
- [x] Stored Procedure `sp_confirmar_atendimento` criada
- [x] Stored Procedure `sp_cancelar_atendimento` criada
- [x] Stored Procedure `sp_marcar_atendimento_realizado` criada
- [x] Stored Procedure `sp_marcar_falta_atendimento` criada
- [x] Stored Procedure `sp_registrar_receita` criada
- [x] Stored Procedure `sp_registrar_despesa` criada
- [x] Stored Procedure `sp_atualizar_status_pagamento` criada
- [x] Stored Procedure `sp_movimentar_estoque` criada
- [x] Function `fn_atualizar_timestamp` criada
- [x] Function `fn_auditoria_geral` criada
- [x] Function `fn_validar_conflito_agenda` criada
- [x] Function `fn_calcular_idade` criada
- [x] Function `fn_calcular_lucro_liquido` criada
- [x] Function `fn_verificar_status_estoque` criada
- [x] Triggers de auditoria criados (`trg_audit_*` para 4 tabelas)
- [x] Triggers de timestamp criados (`trg_upd_timestamp_*` para 8 tabelas)
- [x] Trigger de conflito de agenda criado (`trg_verificar_agenda`)
- [x] View `vw_pacientes_ativos` criada
- [x] View `vw_agenda_diaria` criada
- [x] View `vw_resumo_financeiro_mensal` criada
- [x] View `vw_lista_estoque_critico` criada
- [x] Tabela `usuarios` criada via patch incremental (`docs/sql/patch_usuarios.sql`)
- [x] COMMENTS ON aplicados a todas as tabelas, functions, procedures e views

---

## Backend — Rotas de API

- [x] `GET /api/test-db` — validação de conexão
- [x] `GET /api/pacientes` — listagem via `vw_pacientes_ativos`
- [x] `GET /api/pacientes?id=` — detalhe com contato de emergência
- [x] `POST /api/pacientes` — cadastro via `sp_registrar_paciente_completo`
- [x] `PUT /api/pacientes` — atualização via `sp_atualizar_paciente_completo`
- [x] `DELETE /api/pacientes` — inativação lógica
- [x] `PUT /api/pacientes/anamnese` — atualização via `sp_atualizar_anamnese_completa`
- [x] `GET /api/profissionais` — listagem de profissionais ativos
- [x] `GET /api/agenda` — listagem com filtro opcional por data
- [x] `POST /api/agenda` — agendamento via `sp_agendar_atendimento`
- [x] `GET /api/agenda/diaria` — agenda do dia via `vw_agenda_diaria`
- [x] `PATCH /api/agenda/status` — atualização de status via procedures
- [x] `GET /api/financeiro/receita` — listagem de receitas
- [x] `POST /api/financeiro/receita` — registro via `sp_registrar_receita`
- [x] `DELETE /api/financeiro/receita` — inativação lógica
- [x] `PATCH /api/financeiro/receita/status` — status via `sp_atualizar_status_pagamento`
- [x] `GET /api/financeiro/despesa` — listagem de despesas
- [x] `POST /api/financeiro/despesa` — registro via `sp_registrar_despesa`
- [x] `DELETE /api/financeiro/despesa` — inativação lógica
- [x] `GET /api/financeiro/resumo` — dados mensais via `vw_resumo_financeiro_mensal`
- [x] `GET /api/financeiro/lucro` — cálculo via `fn_calcular_lucro_liquido`
- [x] `GET /api/estoque` — listagem com `fn_verificar_status_estoque`
- [x] `POST /api/estoque` — cadastro de novo item
- [x] `PATCH /api/estoque` — atualização de metadados
- [x] `DELETE /api/estoque` — inativação lógica
- [x] `GET /api/estoque/critico` — itens críticos via `vw_lista_estoque_critico`
- [x] `POST /api/estoque/movimentar` — movimentação via `sp_movimentar_estoque`
- [x] `GET /api/relatorios/resumo` — cards do dashboard
- [x] `GET /api/relatorios/financeiro` — dados para gráficos financeiros
- [x] `GET /api/relatorios/pacientes` — estatísticas e evolução de pacientes
- [x] `GET /api/relatorios/agenda` — distribuição e evolução de agenda
- [x] `GET /api/relatorios/estoque` — resumo e categorias de estoque
- [x] `GET /api/usuarios` — listagem de usuários administrativos
- [x] `POST /api/usuarios` — cadastro de usuário
- [x] `PUT /api/usuarios` — atualização de usuário
- [x] `DELETE /api/usuarios` — inativação lógica de usuário

---

## Frontend — Integração

- [x] Módulo Pacientes integrado com dados reais do banco
- [x] Módulo Agenda integrado com dados reais do banco
- [x] Módulo Financeiro integrado com dados reais do banco
- [x] Módulo Estoque integrado com dados reais do banco
- [x] Módulo Relatórios integrado com dados reais do banco
- [x] Módulo Usuários Administrativos integrado com dados reais do banco
- [x] Dados mockados removidos de todos os módulos (incluindo `mockUsers`)
- [x] `pool` não importado em nenhum componente client-side
- [x] `DATABASE_URL` não exposta em respostas do frontend

---

## Qualidade e Validação

- [ ] `npm run lint` executado sem erros críticos
- [x] `npm run build` executado com sucesso (zero erros TypeScript)
- [x] Sem erro de TypeScript (`npx tsc --noEmit` limpo)
- [x] Sem `DATABASE_URL` ou credenciais expostas no código
- [x] `.env.local` fora do rastreamento Git
- [x] Queries parametrizadas em 100% das rotas
- [x] Todas as rotas de escrita em tabelas de domínio usam stored procedures
- [x] Patches SQL incrementais criados em `docs/sql/`

---

## Versionamento

- [ ] Repositório GitHub atualizado com todos os módulos (push pendente — confirmar com o usuário)
- [x] `database_schema.sql` versionado no repositório
- [x] Pasta `docs/` adicionada ao próximo commit
- [x] `.gitignore` válido (`.env*`, `node_modules`, `.next`)
- [x] Commit final preparado com mensagem descritiva

---

## Documentação Técnica

- [x] `docs/01-visao-geral.md` criado
- [x] `docs/02-modelagem-banco.md` criado
- [x] `docs/03-stored-procedures.md` criado
- [x] `docs/04-functions.md` criado
- [x] `docs/05-triggers.md` criado
- [x] `docs/06-views.md` criado
- [x] `docs/07-integracao-api.md` criado
- [x] `docs/08-deploy-e-ambiente.md` criado
- [x] `docs/09-checklist-entrega.md` criado (este arquivo)
- [x] `docs/10-der-plantuml.md` criado
- [x] `docs/DOCUMENTACAO_FINAL.md` criado
- [x] `README.md` atualizado

---

## Entrega Final

- [ ] `docs/DOCUMENTACAO_FINAL.md` revisado e formatado
- [ ] PDF gerado a partir de `DOCUMENTACAO_FINAL.md` (Google Docs, Word ou Pandoc)
- [ ] PDF submetido no Google Classroom
- [ ] Link do repositório GitHub submetido (se solicitado)
- [ ] Prazo: **03/06/2026**
