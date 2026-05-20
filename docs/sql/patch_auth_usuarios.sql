-- Patch: adiciona colunas de autenticação na tabela usuarios
-- Aplicar no Supabase SQL Editor

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS senha_hash     TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_login   TIMESTAMP,
  ADD COLUMN IF NOT EXISTS tentativas_login INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado      BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN usuarios.senha_hash       IS 'Hash bcrypt da senha do usuário (nunca armazenar texto puro)';
COMMENT ON COLUMN usuarios.ultimo_login     IS 'Data/hora do último login bem-sucedido';
COMMENT ON COLUMN usuarios.tentativas_login IS 'Contador de tentativas de login inválidas consecutivas';
COMMENT ON COLUMN usuarios.bloqueado        IS 'Indica se o acesso do usuário está bloqueado';
