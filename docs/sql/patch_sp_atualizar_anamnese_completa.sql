-- ############################################################################
-- PATCH: sp_atualizar_anamnese_completa
-- PROJETO: PsiClinic — Clínica de Psicologia (POBD / UNIBRA)
-- MOTIVO: A procedure original sp_atualizar_anamnese cobre apenas 3 campos
--         (observacoes_psicologo, objetivo_terapia, ansiedade). A tela de
--         Ficha de Anamnese do sistema atualiza todos os 18 campos clínicos.
--         Esta procedure substitui o UPDATE direto que havia na rota
--         PUT /api/pacientes/anamnese.
-- INSTRUÇÃO: Executar no Supabase SQL Editor (Dashboard > SQL Editor).
--            Não altera tabelas nem dados existentes.
-- ############################################################################

CREATE OR REPLACE PROCEDURE sp_atualizar_anamnese_completa(
    p_anamnese_id         UUID,
    p_motivo_consulta     TEXT,
    p_tempo_queixa        VARCHAR(50),
    p_fez_terapia         BOOLEAN,
    p_terapia_tempo       VARCHAR(50),
    p_doencas_fisicas     TEXT,
    p_medicamentos        TEXT,
    p_hist_psiquiatrico   TEXT,
    p_doencas_mentais     TEXT,
    p_relacao_familiar    TEXT,
    p_sono                TEXT,
    p_alimentacao         TEXT,
    p_substancias         TEXT,
    p_atividade           TEXT,
    p_ansiedade           nivel_ansiedade,
    p_humor               TEXT,
    p_estresse            TEXT,
    p_pensamentos         TEXT,
    p_objetivo            TEXT,
    p_observacoes         TEXT
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

COMMENT ON PROCEDURE sp_atualizar_anamnese_completa IS
'Atualiza todos os campos clínicos da ficha de anamnese de um paciente. '
'Recebe 20 parâmetros cobrindo motivo de consulta, histórico clínico, '
'hábitos, avaliação psicológica e observações do profissional. '
'Atualiza apenas registros com ativo = TRUE. '
'O campo atualizado_em é atualizado automaticamente pela trigger trg_upd_timestamp_anamneses.';
