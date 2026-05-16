-- ############################################################################
-- STORED PROCEDURES: Módulo Profissionais
-- Executar no Supabase SQL Editor antes de usar a tela de Profissionais.
-- ############################################################################

-- Cadastrar novo profissional
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

-- Atualizar dados de um profissional ativo
CREATE OR REPLACE PROCEDURE sp_atualizar_profissional(
    p_id            UUID,
    p_nome          VARCHAR,
    p_registro      VARCHAR,
    p_especialidade VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profissionais
    SET nome                  = p_nome,
        registro_profissional = p_registro,
        especialidade         = p_especialidade
    WHERE id = p_id
      AND ativo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrado ou já inativo (ID: %).', p_id;
    END IF;
END;
$$;

-- Inativar (soft-delete) um profissional
CREATE OR REPLACE PROCEDURE sp_inativar_profissional(
    p_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE profissionais
    SET ativo = FALSE
    WHERE id = p_id
      AND ativo = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profissional não encontrado ou já inativo (ID: %).', p_id;
    END IF;
END;
$$;

-- Comentários de documentação
COMMENT ON PROCEDURE sp_registrar_profissional IS 'Cadastra novo profissional na clínica.';
COMMENT ON PROCEDURE sp_atualizar_profissional IS 'Atualiza dados de um profissional ativo.';
COMMENT ON PROCEDURE sp_inativar_profissional  IS 'Realiza soft-delete de um profissional (ativo = FALSE).';
