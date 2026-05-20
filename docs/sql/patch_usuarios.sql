-- ############################################################################
-- PATCH: Tabela usuarios + Trigger de timestamp
-- PROJETO: PsiClinic — Clínica de Psicologia (POBD / UNIBRA)
-- MOTIVO: A tela /dashboard/usuarios gerencia usuários administrativos do
--         sistema (nome, e-mail, nível de acesso). Não existe tabela usuarios
--         no schema original (que cobre apenas entidades clínicas). Este patch
--         cria a tabela de forma incremental, sem alterar estruturas existentes.
-- INSTRUÇÃO: Executar no Supabase SQL Editor (Dashboard > SQL Editor).
--            Usa IF NOT EXISTS — seguro para execução múltipla.
-- ############################################################################

-- 1. Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS usuarios (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    perfil        VARCHAR(50)  NOT NULL DEFAULT 'admin',
    criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo         BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE usuarios IS
'Usuários administrativos do sistema PsiClinic. '
'O campo perfil suporta os valores: dono (proprietário), admin (administrador). '
'Não armazena credenciais de autenticação — autenticação real requer implementação futura.';

-- 2. Trigger de atualizado_em (reusa a function fn_atualizar_timestamp já existente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'trg_upd_timestamp_usuarios'
          AND event_object_table = 'usuarios'
    ) THEN
        EXECUTE 'CREATE TRIGGER trg_upd_timestamp_usuarios
                 BEFORE UPDATE ON usuarios
                 FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp()';
    END IF;
END $$;

-- 3. Dados iniciais (opcional — remove se não quiser seed)
INSERT INTO usuarios (nome, email, perfil)
VALUES
    ('Administrador', 'admin@psiclinic.com', 'dono')
ON CONFLICT (email) DO NOTHING;
