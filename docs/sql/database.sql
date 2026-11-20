-- ############################################################################
-- PROJETO: Clínica de Psicologia (PsiClinic)
-- DISCIPLINA: Programação e Otimização de Banco de Dados
-- PROFESSOR: André Ribeiro (UNIBRA)
-- SGBD: PostgreSQL
-- VERSÃO: Consolidada (Schema + Patches + Procedures + Views + Seed)
-- GERADO EM: 2026-11-20
-- ############################################################################
-- ORDEM DE EXECUÇÃO:
--   1. Limpeza e extensões
--   2. Tipos enumerados
--   3. Funções auxiliares
--   4. Tabelas
--   5. Triggers de auditoria e timestamps
--   6. Functions de negócio
--   7. Stored Procedures
--   8. Views
--   9. Comentários (documentação)
--  10. Dados iniciais (seed/mock)
-- ############################################################################


-- ============================================================================
-- SEÇÃO 1 — LIMPEZA DE SCHEMA
-- (Execução limpa e idempotente; use com cautela em produção)
-- ============================================================================

DROP VIEW  IF EXISTS vw_lista_estoque_critico       CASCADE;
DROP VIEW  IF EXISTS vw_resumo_financeiro_mensal     CASCADE;
DROP VIEW  IF EXISTS vw_agenda_diaria                CASCADE;
DROP VIEW  IF EXISTS vw_pacientes_ativos             CASCADE;

DROP PROCEDURE IF EXISTS sp_movimentar_estoque(UUID, VARCHAR, INT, TEXT)                                                                                           CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_status_pagamento(UUID, status_pagamento)                                                                                     CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_despesa(VARCHAR, VARCHAR, DECIMAL)                                                                                           CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_receita(UUID, VARCHAR, VARCHAR, DECIMAL)                                                                                     CASCADE;
DROP PROCEDURE IF EXISTS sp_marcar_falta_atendimento(UUID)                                                                                                         CASCADE;
DROP PROCEDURE IF EXISTS sp_marcar_atendimento_realizado(UUID)                                                                                                     CASCADE;
DROP PROCEDURE IF EXISTS sp_cancelar_atendimento(UUID)                                                                                                             CASCADE;
DROP PROCEDURE IF EXISTS sp_confirmar_atendimento(UUID)                                                                                                            CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_status_atendimento(UUID, status_atendimento)                                                                                 CASCADE;
DROP PROCEDURE IF EXISTS sp_agendar_atendimento(DATE, TIME, UUID, UUID, tipo_atendimento, TEXT)                                                                    CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_anamnese(UUID, TEXT, TEXT, nivel_ansiedade)                                                                                  CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_anamnese_completa(UUID, TEXT, VARCHAR, BOOLEAN, VARCHAR, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, nivel_ansiedade, TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_paciente_completo(UUID, VARCHAR, DATE, CHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR)             CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_paciente_completo(VARCHAR, DATE, CHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR)   CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_profissional(VARCHAR, VARCHAR, VARCHAR)                                                                                      CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_profissional(UUID, VARCHAR, VARCHAR, VARCHAR)                                                                                CASCADE;
DROP PROCEDURE IF EXISTS sp_inativar_profissional(UUID)                                                                                                            CASCADE;

DROP FUNCTION IF EXISTS fn_verificar_status_estoque(UUID)  CASCADE;
DROP FUNCTION IF EXISTS fn_calcular_lucro_liquido(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS fn_calcular_idade(DATE)            CASCADE;
DROP FUNCTION IF EXISTS fn_validar_conflito_agenda()       CASCADE;
DROP FUNCTION IF EXISTS fn_auditoria_geral()               CASCADE;
DROP FUNCTION IF EXISTS fn_atualizar_timestamp()           CASCADE;

DROP TABLE IF EXISTS auditoria              CASCADE;
DROP TABLE IF EXISTS estoque_movimentacoes CASCADE;
DROP TABLE IF EXISTS estoque_itens         CASCADE;
DROP TABLE IF EXISTS financeiro_despesas   CASCADE;
DROP TABLE IF EXISTS financeiro_receitas   CASCADE;
DROP TABLE IF EXISTS agenda                CASCADE;
DROP TABLE IF EXISTS profissionais         CASCADE;
DROP TABLE IF EXISTS anamneses             CASCADE;
DROP TABLE IF EXISTS contatos_emergencia   CASCADE;
DROP TABLE IF EXISTS pacientes             CASCADE;
DROP TABLE IF EXISTS usuarios              CASCADE;

DROP TYPE IF EXISTS status_atendimento CASCADE;
DROP TYPE IF EXISTS tipo_atendimento   CASCADE;
DROP TYPE IF EXISTS status_pagamento   CASCADE;
DROP TYPE IF EXISTS nivel_ansiedade    CASCADE;


-- ============================================================================
-- SEÇÃO 2 — EXTENSÕES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- SEÇÃO 3 — TIPOS ENUMERADOS (DOMÍNIOS)
-- ============================================================================

CREATE TYPE status_atendimento AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'faltou');
CREATE TYPE tipo_atendimento   AS ENUM ('presencial', 'online');
CREATE TYPE status_pagamento   AS ENUM ('pago', 'pendente', 'cancelado');
CREATE TYPE nivel_ansiedade    AS ENUM ('leve', 'moderada', 'intensa');


-- ============================================================================
-- SEÇÃO 4 — FUNÇÕES AUXILIARES TÉCNICAS (pré-tabelas)
-- ============================================================================

-- Atualiza automaticamente atualizado_em em qualquer UPDATE
CREATE OR REPLACE FUNCTION fn_atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SEÇÃO 5 — ESTRUTURA DE TABELAS (MODELO FÍSICO)
-- ============================================================================

-- 5.1 AUDITORIA (log imutável — sem ativo nem atualizado_em)
CREATE TABLE auditoria (
    id               SERIAL PRIMARY KEY,
    tabela_afetada   VARCHAR(50)  NOT NULL,
    operacao         VARCHAR(20)  NOT NULL,
    dados_anteriores JSONB,
    dados_novos      JSONB,
    data_operacao    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    usuario          VARCHAR(50)  DEFAULT CURRENT_USER
);

-- 5.2 PACIENTES (entidade central)
CREATE TABLE pacientes (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo   VARCHAR(150) NOT NULL,
    data_nascimento DATE         NOT NULL,
    cpf             CHAR(14)     UNIQUE NOT NULL,
    telefone        VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    endereco        TEXT,
    profissao       VARCHAR(100),
    estado_civil    VARCHAR(50),
    criado_em       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ativo           BOOLEAN      DEFAULT TRUE
);

-- 5.3 CONTATOS DE EMERGÊNCIA
CREATE TABLE contatos_emergencia (
    id          SERIAL PRIMARY KEY,
    paciente_id UUID         REFERENCES pacientes(id) ON DELETE RESTRICT,
    nome        VARCHAR(150) NOT NULL,
    telefone    VARCHAR(20)  NOT NULL,
    relacao     VARCHAR(50)  NOT NULL,
    criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    ativo       BOOLEAN      DEFAULT TRUE
);

-- 5.4 ANAMNESES (ficha clínica detalhada)
CREATE TABLE anamneses (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id             UUID         REFERENCES pacientes(id) ON DELETE RESTRICT,
    motivo_consulta         TEXT         NOT NULL,
    tempo_queixa            VARCHAR(50),
    fez_terapia_antes       BOOLEAN      DEFAULT FALSE,
    tempo_terapia_anterior  VARCHAR(50),
    doencas_fisicas         TEXT,
    uso_medicamentos        TEXT,
    historico_psiquiatrico  TEXT,
    medicacao_controlada    TEXT,
    doencas_mentais_familia TEXT,
    relacao_familiar_desc   TEXT,
    habitos_sono            TEXT,
    habitos_alimentacao     TEXT,
    uso_substancias         TEXT,
    atividade_fisica        TEXT,
    ansiedade               nivel_ansiedade,
    humor                   TEXT,
    estresse                TEXT,
    pensamentos_recorrentes TEXT,
    objetivo_terapia        TEXT,
    observacoes_psicologo   TEXT,
    criado_em               TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ativo                   BOOLEAN      DEFAULT TRUE
);

-- 5.5 PROFISSIONAIS (psicólogos e especialistas)
CREATE TABLE profissionais (
    id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome                  VARCHAR(150) NOT NULL,
    registro_profissional VARCHAR(50)  UNIQUE,
    especialidade         VARCHAR(100),
    criado_em             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ativo                 BOOLEAN      DEFAULT TRUE
);

-- 5.6 AGENDA DE ATENDIMENTOS
CREATE TABLE agenda (
    id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_atendimento  DATE            NOT NULL,
    hora_atendimento  TIME            NOT NULL,
    paciente_id       UUID            REFERENCES pacientes(id)    ON DELETE RESTRICT,
    profissional_id   UUID            REFERENCES profissionais(id) ON DELETE RESTRICT,
    tipo              tipo_atendimento DEFAULT 'presencial',
    status            status_atendimento DEFAULT 'agendado',
    observacoes       TEXT,
    criado_em         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    atualizado_em     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ativo             BOOLEAN         DEFAULT TRUE
);

-- 5.7 FINANCEIRO — RECEITAS (entradas)
CREATE TABLE financeiro_receitas (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_receita    DATE            DEFAULT CURRENT_DATE,
    paciente_id     UUID            REFERENCES pacientes(id) ON DELETE RESTRICT,
    servico         VARCHAR(100)    NOT NULL,
    forma_pagamento VARCHAR(50),
    valor           DECIMAL(10,2)   NOT NULL CHECK (valor >= 0),
    status          status_pagamento DEFAULT 'pago',
    criado_em       TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    atualizado_em   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ativo           BOOLEAN         DEFAULT TRUE
);

-- 5.8 FINANCEIRO — DESPESAS (saídas operacionais)
CREATE TABLE financeiro_despesas (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_despesa  DATE          DEFAULT CURRENT_DATE,
    descricao     VARCHAR(200)  NOT NULL,
    categoria     VARCHAR(50),
    valor         DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    criado_em     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    ativo         BOOLEAN       DEFAULT TRUE
);

-- 5.9 ESTOQUE — ITENS (catálogo de materiais)
CREATE TABLE estoque_itens (
    id                UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_produto      VARCHAR(100) NOT NULL,
    categoria         VARCHAR(50),
    quantidade_atual  INT          DEFAULT 0 CHECK (quantidade_atual  >= 0),
    quantidade_minima INT          DEFAULT 5 CHECK (quantidade_minima >= 0),
    fornecedor        VARCHAR(100),
    criado_em         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ativo             BOOLEAN      DEFAULT TRUE
);

-- 5.10 ESTOQUE — MOVIMENTAÇÕES (histórico imutável — sem ativo)
CREATE TABLE estoque_movimentacoes (
    id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id           UUID        REFERENCES estoque_itens(id) ON DELETE RESTRICT,
    tipo_movimentacao VARCHAR(10) CHECK (tipo_movimentacao IN ('entrada', 'saida')),
    quantidade        INT         NOT NULL CHECK (quantidade > 0),
    data_movimentacao TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    observacao        TEXT
);

-- 5.11 USUÁRIOS ADMINISTRATIVOS DO SISTEMA
CREATE TABLE usuarios (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    perfil        VARCHAR(50)  NOT NULL DEFAULT 'admin',
    senha_hash    TEXT,
    ultimo_login  TIMESTAMP,
    tentativas_login INT       DEFAULT 0,
    bloqueado     BOOLEAN      DEFAULT FALSE,
    criado_em     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    ativo         BOOLEAN      DEFAULT TRUE
);


-- ============================================================================
-- SEÇÃO 6 — TRIGGERS DE AUDITORIA E TIMESTAMPS
-- ============================================================================

-- 6.1 Função de auditoria centralizada (grava JSONB)
CREATE OR REPLACE FUNCTION fn_auditoria_geral()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria (tabela_afetada, operacao, dados_anteriores)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria (tabela_afetada, operacao, dados_anteriores, dados_novos)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO auditoria (tabela_afetada, operacao, dados_novos)
        VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6.2 Triggers de auditoria nas tabelas de domínio crítico
CREATE TRIGGER trg_audit_pacientes
    AFTER INSERT OR UPDATE OR DELETE ON pacientes
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();

CREATE TRIGGER trg_audit_agenda
    AFTER INSERT OR UPDATE OR DELETE ON agenda
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();

CREATE TRIGGER trg_audit_receitas
    AFTER INSERT OR UPDATE OR DELETE ON financeiro_receitas
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();

CREATE TRIGGER trg_audit_despesas
    AFTER INSERT OR UPDATE OR DELETE ON financeiro_despesas
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();

-- 6.3 Triggers de atualizado_em em todas as tabelas com esse campo
-- (exclui auditoria e estoque_movimentacoes que são imutáveis)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name NOT IN ('auditoria', 'estoque_movimentacoes')
    )
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_upd_timestamp_%I
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp()',
            t, t
        );
    END LOOP;
END $$;

-- 6.4 Função e trigger de validação de conflito de agenda
CREATE OR REPLACE FUNCTION fn_validar_conflito_agenda()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM agenda
        WHERE profissional_id    = NEW.profissional_id
          AND data_atendimento   = NEW.data_atendimento
          AND hora_atendimento   = NEW.hora_atendimento
          AND id                != NEW.id
          AND ativo              = TRUE
          AND status            NOT IN ('cancelado')
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: O profissional já possui atendimento ativo neste horário.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_agenda
    BEFORE INSERT OR UPDATE ON agenda
    FOR EACH ROW EXECUTE FUNCTION fn_validar_conflito_agenda();


-- ============================================================================
-- SEÇÃO 7 — FUNCTIONS DE NEGÓCIO
-- ============================================================================

-- Calcula idade a partir da data de nascimento
CREATE OR REPLACE FUNCTION fn_calcular_idade(p_data_nascimento DATE)
RETURNS INT AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, p_data_nascimento));
END;
$$ LANGUAGE plpgsql;

-- Calcula lucro líquido (receitas pagas − despesas) em um período
CREATE OR REPLACE FUNCTION fn_calcular_lucro_liquido(p_data_inicio DATE, p_data_fim DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_receitas DECIMAL(10,2);
    v_despesas DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO v_receitas
    FROM financeiro_receitas
    WHERE data_receita BETWEEN p_data_inicio AND p_data_fim
      AND status = 'pago'
      AND ativo  = TRUE;

    SELECT COALESCE(SUM(valor), 0) INTO v_despesas
    FROM financeiro_despesas
    WHERE data_despesa BETWEEN p_data_inicio AND p_data_fim
      AND ativo = TRUE;

    RETURN v_receitas - v_despesas;
END;
$$ LANGUAGE plpgsql;

-- Verifica status de estoque de um item (CRÍTICO / NORMAL / INEXISTENTE)
CREATE OR REPLACE FUNCTION fn_verificar_status_estoque(p_item_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_atual INT;
    v_min   INT;
BEGIN
    SELECT quantidade_atual, quantidade_minima
    INTO   v_atual, v_min
    FROM   estoque_itens
    WHERE  id    = p_item_id
      AND  ativo = TRUE;

    IF v_atual IS NULL THEN RETURN 'INEXISTENTE'; END IF;
    RETURN CASE WHEN v_atual < v_min THEN 'CRÍTICO' ELSE 'NORMAL' END;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- SEÇÃO 8 — STORED PROCEDURES
-- ============================================================================

-- ─── 8.1 PACIENTES E ANAMNESE ───────────────────────────────────────────────

-- Cadastro transacional: paciente + contato de emergência + anamnese inicial
CREATE OR REPLACE PROCEDURE sp_registrar_paciente_completo(
    p_nome        VARCHAR,
    p_nascimento  DATE,
    p_cpf         CHAR,
    p_tel         VARCHAR,
    p_email       VARCHAR,
    p_end         TEXT,
    p_prof        VARCHAR,
    p_civil       VARCHAR,
    p_emerg_nome  VARCHAR,
    p_emerg_tel   VARCHAR,
    p_emerg_rel   VARCHAR,
    p_motivo      TEXT,
    p_queixa_tempo VARCHAR
)
LANGUAGE plpgsql AS $$
DECLARE
    v_paciente_id UUID;
BEGIN
    INSERT INTO pacientes (nome_completo, data_nascimento, cpf, telefone, email, endereco, profissao, estado_civil)
    VALUES (p_nome, p_nascimento, p_cpf, p_tel, p_email, p_end, p_prof, p_civil)
    RETURNING id INTO v_paciente_id;

    INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
    VALUES (v_paciente_id, p_emerg_nome, p_emerg_tel, p_emerg_rel);

    INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa)
    VALUES (v_paciente_id, p_motivo, p_queixa_tempo);
END;
$$;

-- Atualiza dados do paciente e contato de emergência de forma transacional
CREATE OR REPLACE PROCEDURE sp_atualizar_paciente_completo(
    p_paciente_id UUID,
    p_nome        VARCHAR(150),
    p_nascimento  DATE,
    p_cpf         CHAR(14),
    p_tel         VARCHAR(20),
    p_email       VARCHAR(100),
    p_end         TEXT,
    p_prof        VARCHAR(100),
    p_civil       VARCHAR(50),
    p_emerg_nome  VARCHAR(150),
    p_emerg_tel   VARCHAR(20),
    p_emerg_rel   VARCHAR(50)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE pacientes SET
        nome_completo   = p_nome,
        data_nascimento = p_nascimento,
        cpf             = p_cpf,
        telefone        = p_tel,
        email           = p_email,
        endereco        = p_end,
        profissao       = p_prof,
        estado_civil    = p_civil
    WHERE id = p_paciente_id AND ativo = TRUE;

    IF p_emerg_nome IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM contatos_emergencia
            WHERE paciente_id = p_paciente_id AND ativo = TRUE
        ) THEN
            UPDATE contatos_emergencia SET
                nome     = p_emerg_nome,
                telefone = p_emerg_tel,
                relacao  = p_emerg_rel
            WHERE paciente_id = p_paciente_id AND ativo = TRUE;
        ELSE
            INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
            VALUES (p_paciente_id, p_emerg_nome, p_emerg_tel, p_emerg_rel);
        END IF;
    END IF;
END;
$$;

-- Atualiza 3 campos clínicos da anamnese (versão simplificada — mantida por compatibilidade)
CREATE OR REPLACE PROCEDURE sp_atualizar_anamnese(
    p_anamnese_id  UUID,
    p_obs_psicologo TEXT,
    p_objetivo      TEXT,
    p_ansiedade     nivel_ansiedade
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE anamneses
    SET observacoes_psicologo = p_obs_psicologo,
        objetivo_terapia      = p_objetivo,
        ansiedade             = p_ansiedade
    WHERE id = p_anamnese_id AND ativo = TRUE;
END;
$$;

-- Atualiza todos os 18+ campos clínicos da anamnese (versão completa)
CREATE OR REPLACE PROCEDURE sp_atualizar_anamnese_completa(
    p_anamnese_id       UUID,
    p_motivo_consulta   TEXT,
    p_tempo_queixa      VARCHAR(50),
    p_fez_terapia       BOOLEAN,
    p_terapia_tempo     VARCHAR(50),
    p_doencas_fisicas   TEXT,
    p_medicamentos      TEXT,
    p_hist_psiquiatrico TEXT,
    p_doencas_mentais   TEXT,
    p_relacao_familiar  TEXT,
    p_sono              TEXT,
    p_alimentacao       TEXT,
    p_substancias       TEXT,
    p_atividade         TEXT,
    p_ansiedade         nivel_ansiedade,
    p_humor             TEXT,
    p_estresse          TEXT,
    p_pensamentos       TEXT,
    p_objetivo          TEXT,
    p_observacoes       TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE anamneses SET
        motivo_consulta         = COALESCE(p_motivo_consulta, motivo_consulta),
        tempo_queixa            = p_tempo_queixa,
        fez_terapia_antes       = p_fez_terapia,
        tempo_terapia_anterior  = p_terapia_tempo,
        doencas_fisicas         = p_doencas_fisicas,
        uso_medicamentos        = p_medicamentos,
        historico_psiquiatrico  = p_hist_psiquiatrico,
        doencas_mentais_familia = p_doencas_mentais,
        relacao_familiar_desc   = p_relacao_familiar,
        habitos_sono            = p_sono,
        habitos_alimentacao     = p_alimentacao,
        uso_substancias         = p_substancias,
        atividade_fisica        = p_atividade,
        ansiedade               = p_ansiedade,
        humor                   = p_humor,
        estresse                = p_estresse,
        pensamentos_recorrentes = p_pensamentos,
        objetivo_terapia        = p_objetivo,
        observacoes_psicologo   = p_observacoes
    WHERE id = p_anamnese_id AND ativo = TRUE;
END;
$$;


-- ─── 8.2 PROFISSIONAIS ──────────────────────────────────────────────────────

-- Cadastra novo profissional
CREATE OR REPLACE PROCEDURE sp_registrar_profissional(
    p_nome          VARCHAR,
    p_registro      VARCHAR,
    p_especialidade VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO profissionais (nome, registro_profissional, especialidade)
    VALUES (p_nome, p_registro, p_especialidade);
END;
$$;

-- Atualiza dados de um profissional ativo
CREATE OR REPLACE PROCEDURE sp_atualizar_profissional(
    p_id            UUID,
    p_nome          VARCHAR,
    p_registro      VARCHAR,
    p_especialidade VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profissionais SET
        nome                  = p_nome,
        registro_profissional = p_registro,
        especialidade         = p_especialidade
    WHERE id = p_id AND ativo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrado ou já inativo (ID: %).', p_id;
    END IF;
END;
$$;

-- Soft-delete de um profissional (ativo = FALSE)
CREATE OR REPLACE PROCEDURE sp_inativar_profissional(p_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profissionais SET ativo = FALSE
    WHERE id = p_id AND ativo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrado ou já inativo (ID: %).', p_id;
    END IF;
END;
$$;


-- ─── 8.3 AGENDA ─────────────────────────────────────────────────────────────

-- Cria novo agendamento (dispara trg_verificar_agenda automaticamente)
CREATE OR REPLACE PROCEDURE sp_agendar_atendimento(
    p_data        DATE,
    p_hora        TIME,
    p_paciente    UUID,
    p_profissional UUID,
    p_tipo        tipo_atendimento,
    p_obs         TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, observacoes)
    VALUES (p_data, p_hora, p_paciente, p_profissional, p_tipo, p_obs);
END;
$$;

-- Procedure base de alteração de status (usada pelos wrappers abaixo)
CREATE OR REPLACE PROCEDURE sp_atualizar_status_atendimento(
    p_agenda_id UUID,
    p_status    status_atendimento
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE agenda SET status = p_status
    WHERE id = p_agenda_id AND ativo = TRUE;
END;
$$;

-- Wrappers semânticos de status
CREATE OR REPLACE PROCEDURE sp_confirmar_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN CALL sp_atualizar_status_atendimento(p_agenda_id, 'confirmado'); END;
$$;

CREATE OR REPLACE PROCEDURE sp_cancelar_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN CALL sp_atualizar_status_atendimento(p_agenda_id, 'cancelado'); END;
$$;

CREATE OR REPLACE PROCEDURE sp_marcar_atendimento_realizado(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN CALL sp_atualizar_status_atendimento(p_agenda_id, 'realizado'); END;
$$;

CREATE OR REPLACE PROCEDURE sp_marcar_falta_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN CALL sp_atualizar_status_atendimento(p_agenda_id, 'faltou'); END;
$$;


-- ─── 8.4 FINANCEIRO ─────────────────────────────────────────────────────────

-- Registra nova receita vinculada a um paciente
CREATE OR REPLACE PROCEDURE sp_registrar_receita(
    p_paciente UUID,
    p_servico  VARCHAR,
    p_forma    VARCHAR,
    p_valor    DECIMAL
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO financeiro_receitas (paciente_id, servico, forma_pagamento, valor)
    VALUES (p_paciente, p_servico, p_forma, p_valor);
END;
$$;

-- Registra nova despesa operacional
CREATE OR REPLACE PROCEDURE sp_registrar_despesa(
    p_desc  VARCHAR,
    p_cat   VARCHAR,
    p_valor DECIMAL
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO financeiro_despesas (descricao, categoria, valor)
    VALUES (p_desc, p_cat, p_valor);
END;
$$;

-- Altera status de pagamento de uma receita
CREATE OR REPLACE PROCEDURE sp_atualizar_status_pagamento(
    p_receita_id UUID,
    p_status     status_pagamento
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE financeiro_receitas SET status = p_status
    WHERE id = p_receita_id AND ativo = TRUE;
END;
$$;


-- ─── 8.5 ESTOQUE ────────────────────────────────────────────────────────────

-- Movimenta estoque (entrada ou saída) com validações completas
CREATE OR REPLACE PROCEDURE sp_movimentar_estoque(
    p_item_id UUID,
    p_tipo    VARCHAR,
    p_qtd     INT,
    p_obs     TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_qtd_atual INT;
    v_existe    BOOLEAN;
BEGIN
    -- Valida tipo de movimentação
    IF p_tipo NOT IN ('entrada', 'saida') THEN
        RAISE EXCEPTION 'Tipo de movimentação inválido: %. Use ''entrada'' ou ''saida''.', p_tipo;
    END IF;

    -- Valida existência e status ativo do item
    SELECT TRUE, quantidade_atual
    INTO   v_existe, v_qtd_atual
    FROM   estoque_itens
    WHERE  id = p_item_id AND ativo = TRUE;

    IF v_existe IS NOT TRUE THEN
        RAISE EXCEPTION 'Item de estoque não encontrado ou inativo (ID: %).', p_item_id;
    END IF;

    -- Valida saldo suficiente para saída
    IF p_tipo = 'saida' AND v_qtd_atual < p_qtd THEN
        RAISE EXCEPTION 'Estoque insuficiente para a saída solicitada (Disponível: %, Solicitado: %)', v_qtd_atual, p_qtd;
    END IF;

    -- Registra histórico de movimentação
    INSERT INTO estoque_movimentacoes (item_id, tipo_movimentacao, quantidade, observacao)
    VALUES (p_item_id, p_tipo, p_qtd, p_obs);

    -- Atualiza saldo em tempo real
    IF p_tipo = 'entrada' THEN
        UPDATE estoque_itens SET quantidade_atual = quantidade_atual + p_qtd WHERE id = p_item_id;
    ELSE
        UPDATE estoque_itens SET quantidade_atual = quantidade_atual - p_qtd WHERE id = p_item_id;
    END IF;
END;
$$;


-- ============================================================================
-- SEÇÃO 9 — VIEWS (CAMADA DE LEITURA / RELATÓRIOS)
-- ============================================================================

-- Lista de pacientes ativos com idade calculada em tempo real
CREATE VIEW vw_pacientes_ativos AS
SELECT
    id,
    nome_completo,
    email,
    telefone,
    fn_calcular_idade(data_nascimento) AS idade
FROM pacientes
WHERE ativo = TRUE;

-- Atendimentos do dia corrente com nomes desnormalizados
CREATE VIEW vw_agenda_diaria AS
SELECT
    a.hora_atendimento,
    p.nome_completo  AS paciente,
    prof.nome        AS profissional,
    a.tipo,
    a.status
FROM agenda a
JOIN pacientes    p    ON a.paciente_id    = p.id
JOIN profissionais prof ON a.profissional_id = prof.id
WHERE a.data_atendimento = CURRENT_DATE
  AND a.ativo = TRUE
ORDER BY a.hora_atendimento;

-- Resumo financeiro mensal: receitas, despesas e lucro líquido por mês/ano
CREATE VIEW vw_resumo_financeiro_mensal AS
WITH receitas AS (
    SELECT
        EXTRACT(YEAR  FROM data_receita) AS ano,
        EXTRACT(MONTH FROM data_receita) AS mes,
        SUM(valor)                       AS total_receitas
    FROM financeiro_receitas
    WHERE status = 'pago' AND ativo = TRUE
    GROUP BY 1, 2
),
despesas AS (
    SELECT
        EXTRACT(YEAR  FROM data_despesa) AS ano,
        EXTRACT(MONTH FROM data_despesa) AS mes,
        SUM(valor)                       AS total_despesas
    FROM financeiro_despesas
    WHERE ativo = TRUE
    GROUP BY 1, 2
)
SELECT
    COALESCE(r.ano, d.ano)                                       AS ano,
    COALESCE(r.mes, d.mes)                                       AS mes,
    COALESCE(r.total_receitas, 0)                                AS total_receitas,
    COALESCE(d.total_despesas, 0)                                AS total_despesas,
    (COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0)) AS lucro_liquido
FROM receitas r
FULL OUTER JOIN despesas d ON r.ano = d.ano AND r.mes = d.mes;

-- Itens de estoque abaixo da quantidade mínima (alerta crítico)
CREATE VIEW vw_lista_estoque_critico AS
SELECT
    nome_produto,
    quantidade_atual,
    quantidade_minima,
    fornecedor
FROM estoque_itens
WHERE quantidade_atual < quantidade_minima
  AND ativo = TRUE;


-- ============================================================================
-- SEÇÃO 10 — COMENTÁRIOS DE DOCUMENTAÇÃO (COMMENT ON)
-- ============================================================================

-- Tabelas
COMMENT ON TABLE pacientes             IS 'Cadastro base de pacientes da clínica.';
COMMENT ON TABLE contatos_emergencia   IS 'Contatos de segurança vinculados aos pacientes.';
COMMENT ON TABLE anamneses             IS 'Fichas de anamnese técnica dos pacientes (POBD).';
COMMENT ON TABLE profissionais         IS 'Cadastro de profissionais/psicólogos da clínica.';
COMMENT ON TABLE agenda                IS 'Registro de agendamentos e status de consultas.';
COMMENT ON TABLE financeiro_receitas   IS 'Registro de entradas financeiras (pagamentos de sessões).';
COMMENT ON TABLE financeiro_despesas   IS 'Registro de saídas financeiras operacionais.';
COMMENT ON TABLE estoque_itens         IS 'Catálogo de materiais e controle de saldo.';
COMMENT ON TABLE estoque_movimentacoes IS 'Histórico de entradas e saídas de estoque.';
COMMENT ON TABLE auditoria             IS 'Logs centralizados de operações do sistema (Segurança).';
COMMENT ON TABLE usuarios              IS 'Usuários administrativos do sistema PsiClinic. '
                                          'Perfis suportados: dono (proprietário), admin (administrador).';

-- Colunas sensíveis da tabela usuarios
COMMENT ON COLUMN usuarios.senha_hash       IS 'Hash bcrypt da senha do usuário (nunca armazenar texto puro)';
COMMENT ON COLUMN usuarios.ultimo_login     IS 'Data/hora do último login bem-sucedido';
COMMENT ON COLUMN usuarios.tentativas_login IS 'Contador de tentativas de login inválidas consecutivas';
COMMENT ON COLUMN usuarios.bloqueado        IS 'Indica se o acesso do usuário está bloqueado';

-- Functions
COMMENT ON FUNCTION fn_atualizar_timestamp       IS 'Atualiza automaticamente a data de modificação.';
COMMENT ON FUNCTION fn_auditoria_geral           IS 'Gera logs JSONB para auditoria dinâmica de tabelas.';
COMMENT ON FUNCTION fn_validar_conflito_agenda   IS 'Impede sobreposição de horários para o mesmo profissional.';
COMMENT ON FUNCTION fn_calcular_idade            IS 'Calcula idade a partir da data de nascimento.';
COMMENT ON FUNCTION fn_calcular_lucro_liquido    IS 'Saldo financeiro por período (Receitas - Despesas).';
COMMENT ON FUNCTION fn_verificar_status_estoque  IS 'Valida se item está abaixo do mínimo (Status Crítico).';

-- Stored Procedures
COMMENT ON PROCEDURE sp_registrar_paciente_completo    IS 'Cadastro transacional de paciente, contato e anamnese inicial.';
COMMENT ON PROCEDURE sp_atualizar_paciente_completo    IS 'Atualiza dados cadastrais de um paciente ativo e seu contato de emergência. Substitui BEGIN/COMMIT/ROLLBACK manual da aplicação.';
COMMENT ON PROCEDURE sp_atualizar_anamnese             IS 'Permite a edição simplificada da ficha de anamnese ativa (3 campos). Mantida por compatibilidade.';
COMMENT ON PROCEDURE sp_atualizar_anamnese_completa    IS 'Atualiza todos os campos clínicos da ficha de anamnese de um paciente. Recebe 20 parâmetros cobrindo motivo de consulta, histórico clínico, hábitos, avaliação psicológica e observações do profissional. Atualiza apenas registros com ativo = TRUE.';
COMMENT ON PROCEDURE sp_registrar_profissional         IS 'Cadastra novo profissional na clínica.';
COMMENT ON PROCEDURE sp_atualizar_profissional         IS 'Atualiza dados de um profissional ativo.';
COMMENT ON PROCEDURE sp_inativar_profissional          IS 'Realiza soft-delete de um profissional (ativo = FALSE).';
COMMENT ON PROCEDURE sp_agendar_atendimento            IS 'Cria novo registro na agenda.';
COMMENT ON PROCEDURE sp_atualizar_status_atendimento   IS 'Altera o status de um atendimento ativo.';
COMMENT ON PROCEDURE sp_confirmar_atendimento          IS 'Marca atendimento como confirmado.';
COMMENT ON PROCEDURE sp_cancelar_atendimento           IS 'Marca atendimento como cancelado.';
COMMENT ON PROCEDURE sp_marcar_atendimento_realizado   IS 'Marca atendimento como realizado.';
COMMENT ON PROCEDURE sp_marcar_falta_atendimento       IS 'Marca falta do paciente no atendimento.';
COMMENT ON PROCEDURE sp_registrar_receita              IS 'Insere novo registro de entrada financeira.';
COMMENT ON PROCEDURE sp_registrar_despesa              IS 'Insere novo registro de saída financeira.';
COMMENT ON PROCEDURE sp_atualizar_status_pagamento     IS 'Altera status de pagamento de uma receita ativa.';
COMMENT ON PROCEDURE sp_movimentar_estoque             IS 'Gerencia saldo de estoque com validação de tipo, existência e saldo.';

-- Views
COMMENT ON VIEW vw_pacientes_ativos          IS 'Lista de pacientes com status ativo.';
COMMENT ON VIEW vw_agenda_diaria             IS 'Visão consolidada dos atendimentos do dia atual.';
COMMENT ON VIEW vw_resumo_financeiro_mensal  IS 'Relatório consolidado de lucratividade por mês.';
COMMENT ON VIEW vw_lista_estoque_critico     IS 'Relatório de itens abaixo da quantidade mínima.';


-- ============================================================================
-- SEÇÃO 11 — DADOS INICIAIS (SEED / MOCK)
-- ============================================================================
-- Remove o bloco abaixo em produção; use apenas para desenvolvimento/demo.
-- ============================================================================

-- Usuário administrador padrão
INSERT INTO usuarios (nome, email, perfil)
VALUES ('Administrador', 'admin@psiclinic.com', 'dono')
ON CONFLICT (email) DO NOTHING;

-- Desativa triggers de usuário para permitir datas retroativas sem conflito
ALTER TABLE profissionais      DISABLE TRIGGER USER;
ALTER TABLE pacientes          DISABLE TRIGGER USER;
ALTER TABLE estoque_itens      DISABLE TRIGGER USER;
ALTER TABLE agenda             DISABLE TRIGGER USER;
ALTER TABLE financeiro_receitas DISABLE TRIGGER USER;
ALTER TABLE financeiro_despesas DISABLE TRIGGER USER;

-- Profissionais
INSERT INTO profissionais (nome, registro_profissional, especialidade) VALUES
    ('Dra. Ana Silva',       'CRP 01/12345', 'Terapia Cognitivo-Comportamental'),
    ('Dr. Roberto Costa',    'CRP 02/54321', 'Psicanálise'),
    ('Dra. Juliana Mendes',  'CRP 03/98765', 'Psicologia Infantil')
ON CONFLICT (registro_profissional) DO NOTHING;

-- Pacientes
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, telefone, email, endereco, profissao, estado_civil) VALUES
    ('Carlos Drummond', '1980-05-12', '111.111.111-11', '(11) 91111-1111', 'carlos@email.com',   'Rua A, 123',  'Engenheiro', 'Casado'),
    ('Maria Clara',     '1995-08-22', '222.222.222-22', '(11) 92222-2222', 'maria@email.com',    'Av. B, 456',  'Professora', 'Solteira'),
    ('João Pedro',      '2005-11-30', '333.333.333-33', '(11) 93333-3333', 'joao@email.com',     'Rua C, 789',  'Estudante',  'Solteiro'),
    ('Fernanda Lima',   '1975-02-15', '444.444.444-44', '(11) 94444-4444', 'fernanda@email.com', 'Rua D, 101',  'Advogada',   'Divorciada'),
    ('Rafael Souza',    '1988-07-07', '555.555.555-55', '(11) 95555-5555', 'rafael@email.com',   'Av. E, 202',  'Designer',   'Casado')
ON CONFLICT DO NOTHING;

INSERT INTO pacientes (nome_completo, data_nascimento, cpf, telefone, email, endereco, profissao, estado_civil)
SELECT 'Laura Beatriz', '1990-03-10', '666.666.666-66', '(11) 96666-6666', 'laura@email.com', 'Rua F, 303', 'Médica', 'Casada'
WHERE NOT EXISTS (SELECT 1 FROM pacientes WHERE email = 'laura@email.com');

-- Estoque inicial
INSERT INTO estoque_itens (nome_produto, categoria, quantidade_atual, quantidade_minima, fornecedor) VALUES
    ('Papel Toalha',           'Limpeza',   15,  20,  'Distribuidora LimpaMais'),
    ('Café Expresso (Cápsulas)','Copa',      5,   20,  'Café Premium'),
    ('Caneta Azul',            'Papelaria', 50,  10,  'Kalunga'),
    ('Bloco de Anotações',     'Papelaria',  8,  15,  'Kalunga'),
    ('Álcool em Gel',          'Limpeza',   12,  10,  'Distribuidora LimpaMais'),
    ('Copos Descartáveis',     'Copa',      20, 100,  'Embalagens Silva');

-- Bloco dinâmico: agenda e financeiro dos últimos 150 dias + próximos 15 dias
DO $$
DECLARE
    p_ana      UUID; p_roberto UUID; p_juliana  UUID;
    pac_carlos UUID; pac_maria UUID; pac_joao   UUID;
    pac_fernanda UUID; pac_rafael UUID; pac_laura UUID;
    d DATE; dia_semana INT;
BEGIN
    SELECT id INTO p_ana      FROM profissionais WHERE registro_profissional = 'CRP 01/12345' LIMIT 1;
    SELECT id INTO p_roberto  FROM profissionais WHERE registro_profissional = 'CRP 02/54321' LIMIT 1;
    SELECT id INTO p_juliana  FROM profissionais WHERE registro_profissional = 'CRP 03/98765' LIMIT 1;

    SELECT id INTO pac_carlos   FROM pacientes WHERE email = 'carlos@email.com'   LIMIT 1;
    SELECT id INTO pac_maria    FROM pacientes WHERE email = 'maria@email.com'    LIMIT 1;
    SELECT id INTO pac_joao     FROM pacientes WHERE email = 'joao@email.com'     LIMIT 1;
    SELECT id INTO pac_fernanda FROM pacientes WHERE email = 'fernanda@email.com' LIMIT 1;
    SELECT id INTO pac_rafael   FROM pacientes WHERE email = 'rafael@email.com'   LIMIT 1;
    SELECT id INTO pac_laura    FROM pacientes WHERE email = 'laura@email.com'    LIMIT 1;

    -- Contatos de emergência e anamneses iniciais
    IF pac_carlos IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_carlos) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_carlos, 'Juliana Drummond', '(11) 91111-2222', 'Cônjuge');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_carlos, 'Sentindo muita pressão no trabalho e sintomas de esgotamento.', '3 meses', 'moderada'::nivel_ansiedade, 'Estável, porém cansado', 'Alto devido ao trabalho', 'Desenvolver estratégias de coping e organizar rotina');
    END IF;

    IF pac_maria IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_maria) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_maria, 'Cláudio Clara', '(11) 92222-3333', 'Pai');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_maria, 'Dificuldade de concentração e desmotivação geral com a carreira.', '6 meses', 'leve'::nivel_ansiedade, 'Oscilante', 'Moderado', 'Trabalhar autoconhecimento e planejamento de carreira');
    END IF;

    IF pac_joao IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_joao) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_joao, 'Marta Pedro', '(11) 93333-4444', 'Mãe');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_joao, 'Dificuldade de socialização na escola e oscilações bruscas de humor.', '1 ano', 'intensa'::nivel_ansiedade, 'Irritadiço', 'Alto na escola', 'Melhorar habilidades sociais e regulação emocional');
    END IF;

    IF pac_fernanda IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_fernanda) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_fernanda, 'Alberto Lima', '(11) 94444-5555', 'Irmão');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_fernanda, 'Insônia crônica e crises recorrentes de ansiedade.', '2 meses', 'intensa'::nivel_ansiedade, 'Ansioso', 'Muito alto', 'Reduzir ansiedade geral e restaurar padrão de sono saudável');
    END IF;

    IF pac_rafael IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_rafael) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_rafael, 'Gisele Souza', '(11) 95555-6666', 'Esposa');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_rafael, 'Processo de transição de carreira gerando muitas dúvidas e insegurança.', '1 mês', 'leve'::nivel_ansiedade, 'Ansioso/Expectante', 'Moderado', 'Trabalhar autoestima e foco profissional');
    END IF;

    IF pac_laura IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_laura) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
        VALUES (pac_laura, 'Bruno Beatriz', '(11) 96666-7777', 'Marido');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_laura, 'Desejo de iniciar terapia para desenvolvimento pessoal geral e autoconhecimento.', 'N/A', 'leve'::nivel_ansiedade, 'Excelente', 'Baixo', 'Desenvolver inteligência emocional e autoconhecimento');
    END IF;

    -- Limpa dados de agenda/financeiro anteriores para re-execução segura
    DELETE FROM agenda              WHERE paciente_id IN (pac_carlos, pac_maria, pac_joao, pac_fernanda, pac_rafael, pac_laura);
    DELETE FROM financeiro_receitas WHERE paciente_id IN (pac_carlos, pac_maria, pac_joao, pac_fernanda, pac_rafael, pac_laura);
    DELETE FROM financeiro_despesas WHERE descricao IN (
        'Aluguel do Consultório', 'Internet / Telefone',
        'Material de Escritório', 'Produtos de Limpeza', 'Anúncios Instagram/Google'
    );

    -- Laço: últimos 150 dias e próximos 15 dias
    FOR i IN -15..150 LOOP
        d           := CURRENT_DATE - i;
        dia_semana  := EXTRACT(DOW FROM d);

        -- Carlos — toda Segunda (DOW = 1) com Dra. Ana
        IF dia_semana = 1 AND pac_carlos IS NOT NULL THEN
            INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
            VALUES (d, '09:00', pac_carlos, p_ana, 'presencial',
                    CASE WHEN i <= 0 THEN 'agendado'::status_atendimento ELSE 'realizado'::status_atendimento END);
            IF i > 0 THEN
                INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                VALUES (d, pac_carlos, 'Sessão Psicoterapia', 'PIX', 150.00, 'pago');
            END IF;
        END IF;

        -- Maria — toda Quarta (DOW = 3) com Dr. Roberto (simula falta a cada 5)
        IF dia_semana = 3 AND pac_maria IS NOT NULL THEN
            IF i > 0 AND (i % 5) = 0 THEN
                INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
                VALUES (d, '14:00', pac_maria, p_roberto, 'online', 'faltou'::status_atendimento);
            ELSE
                INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
                VALUES (d, '14:00', pac_maria, p_roberto, 'online',
                        CASE WHEN i <= 0 THEN 'confirmado'::status_atendimento ELSE 'realizado'::status_atendimento END);
                IF i > 0 THEN
                    INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                    VALUES (d, pac_maria, 'Psicoterapia Online', 'Cartão de Crédito', 130.00, 'pago');
                END IF;
            END IF;
        END IF;

        -- João — toda Sexta (DOW = 5) com Dra. Juliana
        IF dia_semana = 5 AND pac_joao IS NOT NULL THEN
            INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
            VALUES (d, '16:00', pac_joao, p_juliana, 'presencial',
                    CASE WHEN i <= 0 THEN 'agendado'::status_atendimento ELSE 'realizado'::status_atendimento END);
            IF i > 0 THEN
                INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                VALUES (d, pac_joao, 'Avaliação Infantil', 'Dinheiro', 180.00, 'pago');
            END IF;
        END IF;

        -- Despesas fixas (dia 5 do mês)
        IF EXTRACT(DAY FROM d) = 5 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor)
            VALUES (d, 'Aluguel do Consultório', 'Infraestrutura', 1500.00),
                   (d, 'Internet / Telefone',    'Infraestrutura',  150.00);
        END IF;

        -- Despesas variáveis (dia 20 do mês)
        IF EXTRACT(DAY FROM d) = 20 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor)
            VALUES (d, 'Material de Escritório', 'Papelaria',   80.00),
                   (d, 'Produtos de Limpeza',    'Manutenção', 120.00);
        END IF;

        -- Marketing (dia 15 do mês)
        IF EXTRACT(DAY FROM d) = 15 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor)
            VALUES (d, 'Anúncios Instagram/Google', 'Marketing', 200.00);
        END IF;

    END LOOP;
END $$;

-- Reativa triggers de usuário
ALTER TABLE profissionais       ENABLE TRIGGER USER;
ALTER TABLE pacientes           ENABLE TRIGGER USER;
ALTER TABLE estoque_itens       ENABLE TRIGGER USER;
ALTER TABLE agenda              ENABLE TRIGGER USER;
ALTER TABLE financeiro_receitas ENABLE TRIGGER USER;
ALTER TABLE financeiro_despesas ENABLE TRIGGER USER;

-- ############################################################################
-- FIM DO SCRIPT banco.sql — PsiClinic
-- ############################################################################
