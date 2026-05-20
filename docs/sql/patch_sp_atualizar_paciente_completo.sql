-- ############################################################################
-- PATCH: sp_atualizar_paciente_completo
-- PROJETO: PsiClinic — Clínica de Psicologia (POBD / UNIBRA)
-- MOTIVO: A rota PUT /api/pacientes usava UPDATE direto com transação manual
--         (BEGIN/COMMIT/ROLLBACK) na camada de aplicação. Esta procedure
--         encapsula a lógica no banco, atualizando dados do paciente e seu
--         contato de emergência de forma transacional e centralizada.
-- INSTRUÇÃO: Executar no Supabase SQL Editor (Dashboard > SQL Editor).
--            Não altera tabelas nem dados existentes.
-- ############################################################################

CREATE OR REPLACE PROCEDURE sp_atualizar_paciente_completo(
    p_paciente_id  UUID,
    p_nome         VARCHAR(150),
    p_nascimento   DATE,
    p_cpf          CHAR(14),
    p_tel          VARCHAR(20),
    p_email        VARCHAR(100),
    p_end          TEXT,
    p_prof         VARCHAR(100),
    p_civil        VARCHAR(50),
    p_emerg_nome   VARCHAR(150),
    p_emerg_tel    VARCHAR(20),
    p_emerg_rel    VARCHAR(50)
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Atualiza dados cadastrais do paciente
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

    -- Atualiza ou insere contato de emergência, se fornecido
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

COMMENT ON PROCEDURE sp_atualizar_paciente_completo IS
'Atualiza dados cadastrais de um paciente ativo e seu contato de emergência. '
'Recebe 12 parâmetros: ID do paciente, dados pessoais (nome, nascimento, CPF, '
'telefone, e-mail, endereço, profissão, estado civil) e dados do contato de '
'emergência (nome, telefone, relação). Se o contato de emergência ainda não '
'existir, um novo é inserido. Se p_emerg_nome for NULL, o contato não é alterado. '
'Substitui a transação manual BEGIN/COMMIT/ROLLBACK que havia na camada de aplicação.';
