-- ############################################################################
-- PROJETO: Clínica de Psicologia (PsiClinic)
-- DISCIPLINA: Programação e Otimização de Banco de Dados
-- PROFESSOR: André Ribeiro (UNIBRA)
-- SGBD: PostgreSQL
-- VERSÃO: Final (Refinada)
-- ############################################################################

-- 1. LIMPEZA DE SCHEMA (Execução limpa em ambiente de testes)
DROP VIEW IF EXISTS vw_lista_estoque_critico CASCADE;
DROP VIEW IF EXISTS vw_resumo_financeiro_mensal CASCADE;
DROP VIEW IF EXISTS vw_agenda_diaria CASCADE;
DROP VIEW IF EXISTS vw_pacientes_ativos CASCADE;

DROP PROCEDURE IF EXISTS sp_movimentar_estoque(UUID, VARCHAR, INT, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_status_pagamento(UUID, status_pagamento) CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_despesa(VARCHAR, VARCHAR, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_receita(UUID, VARCHAR, VARCHAR, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS sp_marcar_falta_atendimento(UUID) CASCADE;
DROP PROCEDURE IF EXISTS sp_marcar_atendimento_realizado(UUID) CASCADE;
DROP PROCEDURE IF EXISTS sp_cancelar_atendimento(UUID) CASCADE;
DROP PROCEDURE IF EXISTS sp_confirmar_atendimento(UUID) CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_status_atendimento(UUID, status_atendimento) CASCADE;
DROP PROCEDURE IF EXISTS sp_agendar_atendimento(DATE, TIME, UUID, UUID, tipo_atendimento, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS sp_atualizar_anamnese(UUID, TEXT, TEXT, nivel_ansiedade) CASCADE;
DROP PROCEDURE IF EXISTS sp_registrar_paciente_completo(VARCHAR, DATE, CHAR, VARCHAR, VARCHAR, TEXT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, VARCHAR) CASCADE;

DROP FUNCTION IF EXISTS fn_verificar_status_estoque(UUID) CASCADE;
DROP FUNCTION IF EXISTS fn_calcular_lucro_liquido(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS fn_calcular_idade(DATE) CASCADE;
DROP FUNCTION IF EXISTS fn_validar_conflito_agenda() CASCADE;
DROP FUNCTION IF EXISTS fn_auditoria_geral() CASCADE;
DROP FUNCTION IF EXISTS fn_atualizar_timestamp() CASCADE;

DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS estoque_movimentacoes CASCADE;
DROP TABLE IF EXISTS estoque_itens CASCADE;
DROP TABLE IF EXISTS financeiro_despesas CASCADE;
DROP TABLE IF EXISTS financeiro_receitas CASCADE;
DROP TABLE IF EXISTS agenda CASCADE;
DROP TABLE IF EXISTS profissionais CASCADE;
DROP TABLE IF EXISTS anamneses CASCADE;
DROP TABLE IF EXISTS contatos_emergencia CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;

DROP TYPE IF EXISTS status_atendimento CASCADE;
DROP TYPE IF EXISTS tipo_atendimento CASCADE;
DROP TYPE IF EXISTS status_pagamento CASCADE;
DROP TYPE IF EXISTS nivel_ansiedade CASCADE;

-- 2. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TIPOS ENUMERADOS (DOMÍNIOS)
CREATE TYPE status_atendimento AS ENUM ('agendado', 'confirmado', 'realizado', 'cancelado', 'faltou');
CREATE TYPE tipo_atendimento AS ENUM ('presencial', 'online');
CREATE TYPE status_pagamento AS ENUM ('pago', 'pendente', 'cancelado');
CREATE TYPE nivel_ansiedade AS ENUM ('leve', 'moderada', 'intensa');

-- 4. FUNÇÕES AUXILIARES TÉCNICAS
CREATE OR REPLACE FUNCTION fn_atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. ESTRUTURA DE TABELAS (MODELO FÍSICO)

-- 5.1. AUDITORIA (LOGS)
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    tabela_afetada VARCHAR(50) NOT NULL,
    operacao VARCHAR(20) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    data_operacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(50) DEFAULT CURRENT_USER
);

-- 5.2. PACIENTES
CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    cpf CHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    endereco TEXT,
    profissao VARCHAR(100),
    estado_civil VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.3. CONTATO DE EMERGÊNCIA
CREATE TABLE contatos_emergencia (
    id SERIAL PRIMARY KEY,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    relacao VARCHAR(50) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.4. ANAMNESES
CREATE TABLE anamneses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    motivo_consulta TEXT NOT NULL,
    tempo_queixa VARCHAR(50),
    fez_terapia_antes BOOLEAN DEFAULT FALSE,
    tempo_terapia_anterior VARCHAR(50),
    doencas_fisicas TEXT,
    uso_medicamentos TEXT,
    historico_psiquiatrico TEXT,
    medicacao_controlada TEXT,
    doencas_mentais_familia TEXT,
    relacao_familiar_desc TEXT,
    habitos_sono TEXT,
    habitos_alimentacao TEXT,
    uso_substancias TEXT,
    atividade_fisica TEXT,
    ansiedade nivel_ansiedade,
    humor TEXT,
    estresse TEXT,
    pensamentos_recorrentes TEXT,
    objetivo_terapia TEXT,
    observacoes_psicologo TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.5. PROFISSIONAIS
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(150) NOT NULL,
    registro_profissional VARCHAR(50) UNIQUE,
    especialidade VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.6. AGENDA DE ATENDIMENTOS
CREATE TABLE agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_atendimento DATE NOT NULL,
    hora_atendimento TIME NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE RESTRICT,
    tipo tipo_atendimento DEFAULT 'presencial',
    status status_atendimento DEFAULT 'agendado',
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.7. FINANCEIRO - RECEITAS
CREATE TABLE financeiro_receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_receita DATE DEFAULT CURRENT_DATE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE RESTRICT,
    servico VARCHAR(100) NOT NULL,
    forma_pagamento VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    status status_pagamento DEFAULT 'pago',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.8. FINANCEIRO - DESPESAS
CREATE TABLE financeiro_despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_despesa DATE DEFAULT CURRENT_DATE,
    descricao VARCHAR(200) NOT NULL,
    categoria VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.9. ESTOQUE - ITENS
CREATE TABLE estoque_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_produto VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    quantidade_atual INT DEFAULT 0 CHECK (quantidade_atual >= 0),
    quantidade_minima INT DEFAULT 5 CHECK (quantidade_minima >= 0),
    fornecedor VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE
);

-- 5.10. ESTOQUE - MOVIMENTAÇÕES
CREATE TABLE estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES estoque_itens(id) ON DELETE RESTRICT,
    tipo_movimentacao VARCHAR(10) CHECK (tipo_movimentacao IN ('entrada', 'saida')),
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacao TEXT
);

-- 6. MECANISMOS DE AUDITORIA (TRIGGERS)

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

CREATE TRIGGER trg_audit_receitas AFTER INSERT OR UPDATE OR DELETE ON financeiro_receitas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();
CREATE TRIGGER trg_audit_despesas AFTER INSERT OR UPDATE OR DELETE ON financeiro_despesas FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();
CREATE TRIGGER trg_audit_agenda AFTER INSERT OR UPDATE OR DELETE ON agenda FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();
CREATE TRIGGER trg_audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION fn_auditoria_geral();

DO $$ 
DECLARE 
    t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name NOT IN ('auditoria', 'estoque_movimentacoes')) 
    LOOP
        EXECUTE format('CREATE TRIGGER trg_upd_timestamp_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp()', t, t);
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION fn_validar_conflito_agenda()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM agenda 
        WHERE profissional_id = NEW.profissional_id 
        AND data_atendimento = NEW.data_atendimento 
        AND hora_atendimento = NEW.hora_atendimento
        AND id != NEW.id
        AND ativo = TRUE
        AND status NOT IN ('cancelado')
    ) THEN
        RAISE EXCEPTION 'Conflito de agenda: O profissional já possui atendimento ativo neste horário.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_agenda BEFORE INSERT OR UPDATE ON agenda FOR EACH ROW EXECUTE FUNCTION fn_validar_conflito_agenda();

-- 7. FUNCTIONS (LÓGICA E CÁLCULOS)

CREATE OR REPLACE FUNCTION fn_calcular_idade(p_data_nascimento DATE)
RETURNS INT AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, p_data_nascimento));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_calcular_lucro_liquido(p_data_inicio DATE, p_data_fim DATE)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_receitas DECIMAL(10,2);
    v_despesas DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(valor), 0) INTO v_receitas FROM financeiro_receitas 
    WHERE data_receita BETWEEN p_data_inicio AND p_data_fim AND status = 'pago' AND ativo = TRUE;
    
    SELECT COALESCE(SUM(valor), 0) INTO v_despesas FROM financeiro_despesas 
    WHERE data_despesa BETWEEN p_data_inicio AND p_data_fim AND ativo = TRUE;
    
    RETURN v_receitas - v_despesas;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_verificar_status_estoque(p_item_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
    v_atual INT;
    v_min INT;
BEGIN
    SELECT quantidade_atual, quantidade_minima INTO v_atual, v_min FROM estoque_itens WHERE id = p_item_id AND ativo = TRUE;
    IF v_atual IS NULL THEN RETURN 'INEXISTENTE'; END IF;
    RETURN CASE WHEN v_atual < v_min THEN 'CRÍTICO' ELSE 'NORMAL' END;
END;
$$ LANGUAGE plpgsql;

-- 8. STORED PROCEDURES (ENCAPSULAMENTO DE CRUD)

-- 8.1. PACIENTES E ANAMNESE
CREATE OR REPLACE PROCEDURE sp_registrar_paciente_completo(
    p_nome VARCHAR, p_nascimento DATE, p_cpf CHAR, p_tel VARCHAR, p_email VARCHAR, p_end TEXT, p_prof VARCHAR, p_civil VARCHAR,
    p_emerg_nome VARCHAR, p_emerg_tel VARCHAR, p_emerg_rel VARCHAR,
    p_motivo TEXT, p_queixa_tempo VARCHAR
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

CREATE OR REPLACE PROCEDURE sp_atualizar_anamnese(
    p_anamnese_id UUID, p_obs_psicologo TEXT, p_objetivo TEXT, p_ansiedade nivel_ansiedade
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE anamneses SET observacoes_psicologo = p_obs_psicologo, objetivo_terapia = p_objetivo, ansiedade = p_ansiedade
    WHERE id = p_anamnese_id AND ativo = TRUE;
END;
$$;

-- 8.2. AGENDA
CREATE OR REPLACE PROCEDURE sp_agendar_atendimento(
    p_data DATE, p_hora TIME, p_paciente UUID, p_profissional UUID, p_tipo tipo_atendimento, p_obs TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, observacoes)
    VALUES (p_data, p_hora, p_paciente, p_profissional, p_tipo, p_obs);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_atualizar_status_atendimento(p_agenda_id UUID, p_status status_atendimento)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE agenda SET status = p_status WHERE id = p_agenda_id AND ativo = TRUE;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_confirmar_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_atualizar_status_atendimento(p_agenda_id, 'confirmado');
END;
$$;

CREATE OR REPLACE PROCEDURE sp_cancelar_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_atualizar_status_atendimento(p_agenda_id, 'cancelado');
END;
$$;

CREATE OR REPLACE PROCEDURE sp_marcar_atendimento_realizado(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_atualizar_status_atendimento(p_agenda_id, 'realizado');
END;
$$;

CREATE OR REPLACE PROCEDURE sp_marcar_falta_atendimento(p_agenda_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL sp_atualizar_status_atendimento(p_agenda_id, 'faltou');
END;
$$;

-- 8.3. FINANCEIRO
CREATE OR REPLACE PROCEDURE sp_registrar_receita(p_paciente UUID, p_servico VARCHAR, p_forma VARCHAR, p_valor DECIMAL)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO financeiro_receitas (paciente_id, servico, forma_pagamento, valor)
    VALUES (p_paciente, p_servico, p_forma, p_valor);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_registrar_despesa(p_desc VARCHAR, p_cat VARCHAR, p_valor DECIMAL)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO financeiro_despesas (descricao, categoria, valor)
    VALUES (p_desc, p_cat, p_valor);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_atualizar_status_pagamento(p_receita_id UUID, p_status status_pagamento)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE financeiro_receitas SET status = p_status WHERE id = p_receita_id AND ativo = TRUE;
END;
$$;

-- 8.4. ESTOQUE
CREATE OR REPLACE PROCEDURE sp_movimentar_estoque(p_item_id UUID, p_tipo VARCHAR, p_qtd INT, p_obs TEXT)
LANGUAGE plpgsql AS $$
DECLARE
    v_qtd_atual INT;
    v_existe BOOLEAN;
BEGIN
    -- Validar tipo de movimentação
    IF p_tipo NOT IN ('entrada', 'saida') THEN
        RAISE EXCEPTION 'Tipo de movimentação inválido: %. Use ''entrada'' ou ''saida''.', p_tipo;
    END IF;

    -- Validar se o item existe e está ativo
    SELECT TRUE, quantidade_atual INTO v_existe, v_qtd_atual 
    FROM estoque_itens WHERE id = p_item_id AND ativo = TRUE;

    IF v_existe IS NOT TRUE THEN
        RAISE EXCEPTION 'Item de estoque não encontrado ou inativo (ID: %).', p_item_id;
    END IF;

    -- Validar saldo para saída
    IF p_tipo = 'saida' AND v_qtd_atual < p_qtd THEN
        RAISE EXCEPTION 'Estoque insuficiente para a saída solicitada (Disponível: %, Solicitado: %)', v_qtd_atual, p_qtd;
    END IF;

    -- Registrar movimento histórico
    INSERT INTO estoque_movimentacoes (item_id, tipo_movimentacao, quantidade, observacao)
    VALUES (p_item_id, p_tipo, p_qtd, p_obs);
    
    -- Atualizar saldo em tempo real
    IF p_tipo = 'entrada' THEN
        UPDATE estoque_itens SET quantidade_atual = quantidade_atual + p_qtd WHERE id = p_item_id;
    ELSE
        UPDATE estoque_itens SET quantidade_atual = quantidade_atual - p_qtd WHERE id = p_item_id;
    END IF;
END;
$$;

-- 9. VIEWS (RELATÓRIOS)

CREATE VIEW vw_pacientes_ativos AS
SELECT id, nome_completo, email, telefone, fn_calcular_idade(data_nascimento) as idade
FROM pacientes WHERE ativo = TRUE;

CREATE VIEW vw_agenda_diaria AS
SELECT a.hora_atendimento, p.nome_completo as paciente, prof.nome as profissional, a.tipo, a.status
FROM agenda a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais prof ON a.profissional_id = prof.id
WHERE a.data_atendimento = CURRENT_DATE AND a.ativo = TRUE
ORDER BY a.hora_atendimento;

CREATE VIEW vw_resumo_financeiro_mensal AS
WITH receitas AS (
    SELECT EXTRACT(YEAR FROM data_receita) as ano, EXTRACT(MONTH FROM data_receita) as mes, SUM(valor) as total_receitas
    FROM financeiro_receitas WHERE status = 'pago' AND ativo = TRUE GROUP BY 1, 2
),
despesas AS (
    SELECT EXTRACT(YEAR FROM data_despesa) as ano, EXTRACT(MONTH FROM data_despesa) as mes, SUM(valor) as total_despesas
    FROM financeiro_despesas WHERE ativo = TRUE GROUP BY 1, 2
)
SELECT COALESCE(r.ano, d.ano) as ano, COALESCE(r.mes, d.mes) as mes, COALESCE(r.total_receitas, 0) as total_receitas,
       COALESCE(d.total_despesas, 0) as total_despesas, (COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0)) as lucro_liquido
FROM receitas r FULL OUTER JOIN despesas d ON r.ano = d.ano AND r.mes = d.mes;

CREATE VIEW vw_lista_estoque_critico AS
SELECT nome_produto, quantidade_atual, quantidade_minima, fornecedor FROM estoque_itens
WHERE quantidade_atual < quantidade_minima AND ativo = TRUE;

-- 10. DOCUMENTAÇÃO (COMMENTS ON)

COMMENT ON TABLE pacientes IS 'Cadastro base de pacientes da clínica.';
COMMENT ON TABLE contatos_emergencia IS 'Contatos de segurança vinculados aos pacientes.';
COMMENT ON TABLE anamneses IS 'Fichas de anamnese técnica dos pacientes (POBD).';
COMMENT ON TABLE profissionais IS 'Cadastro de profissionais/psicólogos da clínica.';
COMMENT ON TABLE agenda IS 'Registro de agendamentos e status de consultas.';
COMMENT ON TABLE financeiro_receitas IS 'Registro de entradas financeiras (pagamentos de sessões).';
COMMENT ON TABLE financeiro_despesas IS 'Registro de saídas financeiras operacionais.';
COMMENT ON TABLE estoque_itens IS 'Catálogo de materiais e controle de saldo.';
COMMENT ON TABLE estoque_movimentacoes IS 'Histórico de entradas e saídas de estoque.';
COMMENT ON TABLE auditoria IS 'Logs centralizados de operações do sistema (Segurança).';

COMMENT ON FUNCTION fn_atualizar_timestamp IS 'Atualiza automaticamente a data de modificação.';
COMMENT ON FUNCTION fn_auditoria_geral IS 'Gera logs JSONB para auditoria dinâmica de tabelas.';
COMMENT ON FUNCTION fn_validar_conflito_agenda IS 'Impede sobreposição de horários para o mesmo profissional.';
COMMENT ON FUNCTION fn_calcular_idade IS 'Calcula idade a partir da data de nascimento.';
COMMENT ON FUNCTION fn_calcular_lucro_liquido IS 'Saldo financeiro por período (Receitas - Despesas).';
COMMENT ON FUNCTION fn_verificar_status_estoque IS 'Valida se item está abaixo do mínimo (Status Crítico).';

COMMENT ON PROCEDURE sp_registrar_paciente_completo IS 'Cadastro transacional de paciente, contato e anamnese inicial.';
COMMENT ON PROCEDURE sp_atualizar_anamnese IS 'Permite a edição da ficha de anamnese ativa.';
COMMENT ON PROCEDURE sp_agendar_atendimento IS 'Cria novo registro na agenda.';
COMMENT ON PROCEDURE sp_atualizar_status_atendimento IS 'Altera o status de um atendimento ativo.';
COMMENT ON PROCEDURE sp_confirmar_atendimento IS 'Marca atendimento como confirmado.';
COMMENT ON PROCEDURE sp_cancelar_atendimento IS 'Marca atendimento como cancelado.';
COMMENT ON PROCEDURE sp_marcar_atendimento_realizado IS 'Marca atendimento como realizado.';
COMMENT ON PROCEDURE sp_marcar_falta_atendimento IS 'Marca falta do paciente no atendimento.';
COMMENT ON PROCEDURE sp_registrar_receita IS 'Insere novo registro de entrada financeira.';
COMMENT ON PROCEDURE sp_registrar_despesa IS 'Insere novo registro de saída financeira.';
COMMENT ON PROCEDURE sp_atualizar_status_pagamento IS 'Altera status de pagamento de uma receita ativa.';
COMMENT ON PROCEDURE sp_movimentar_estoque IS 'Gerencia saldo de estoque com validação de tipo, existência e saldo.';

COMMENT ON VIEW vw_pacientes_ativos IS 'Lista de pacientes com status ativo.';
COMMENT ON VIEW vw_agenda_diaria IS 'Visão consolidada dos atendimentos do dia atual.';
COMMENT ON VIEW vw_resumo_financeiro_mensal IS 'Relatório consolidado de lucratividade por mês.';
COMMENT ON VIEW vw_lista_estoque_critico IS 'Relatório de itens abaixo da quantidade mínima.';
