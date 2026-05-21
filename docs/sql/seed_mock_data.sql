-- ############################################################################
-- SCRIPT DE POPULAÇÃO DE DADOS (MOCK) PARA APRESENTAÇÃO
-- Este script insere dados realistas nos últimos 6 meses para gerar gráficos
-- ############################################################################

-- Desativar triggers de usuário temporariamente para permitir dados retroativos e evitar conflitos no mock (sem tocar nos triggers de sistema)
ALTER TABLE profissionais DISABLE TRIGGER USER;
ALTER TABLE pacientes DISABLE TRIGGER USER;
ALTER TABLE estoque_itens DISABLE TRIGGER USER;
ALTER TABLE agenda DISABLE TRIGGER USER;
ALTER TABLE financeiro_receitas DISABLE TRIGGER USER;
ALTER TABLE financeiro_despesas DISABLE TRIGGER USER;

-- 1. PROFISSIONAIS
INSERT INTO profissionais (nome, registro_profissional, especialidade) VALUES
('Dra. Ana Silva', 'CRP 01/12345', 'Terapia Cognitivo-Comportamental'),
('Dr. Roberto Costa', 'CRP 02/54321', 'Psicanálise'),
('Dra. Juliana Mendes', 'CRP 03/98765', 'Psicologia Infantil')
ON CONFLICT (registro_profissional) DO NOTHING;

-- 2. PACIENTES
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, telefone, email, endereco, profissao, estado_civil) VALUES
('Carlos Drummond', '1980-05-12', '111.111.111-11', '(11) 91111-1111', 'carlos@email.com', 'Rua A, 123', 'Engenheiro', 'Casado'),
('Maria Clara', '1995-08-22', '222.222.222-22', '(11) 92222-2222', 'maria@email.com', 'Av. B, 456', 'Professora', 'Solteira'),
('João Pedro', '2005-11-30', '333.333.333-33', '(11) 93333-3333', 'joao@email.com', 'Rua C, 789', 'Estudante', 'Solteiro'),
('Fernanda Lima', '1975-02-15', '444.444.444-44', '(11) 94444-4444', 'fernanda@email.com', 'Rua D, 101', 'Advogada', 'Divorciada'),
('Rafael Souza', '1988-07-07', '555.555.555-55', '(11) 95555-5555', 'rafael@email.com', 'Av. E, 202', 'Designer', 'Casado')
ON CONFLICT DO NOTHING;

-- Actually, since email is UNIQUE, let's just insert ignoring duplicates
INSERT INTO pacientes (nome_completo, data_nascimento, cpf, telefone, email, endereco, profissao, estado_civil) 
SELECT 'Laura Beatriz', '1990-03-10', '666.666.666-66', '(11) 96666-6666', 'laura@email.com', 'Rua F, 303', 'Médica', 'Casada'
WHERE NOT EXISTS (SELECT 1 FROM pacientes WHERE email = 'laura@email.com');

-- 3. ESTOQUE
INSERT INTO estoque_itens (nome_produto, categoria, quantidade_atual, quantidade_minima, fornecedor) VALUES
('Papel Toalha', 'Limpeza', 15, 20, 'Distribuidora LimpaMais'),
('Café Expresso (Cápsulas)', 'Copa', 5, 20, 'Café Premium'),
('Caneta Azul', 'Papelaria', 50, 10, 'Kalunga'),
('Bloco de Anotações', 'Papelaria', 8, 15, 'Kalunga'),
('Álcool em Gel', 'Limpeza', 12, 10, 'Distribuidora LimpaMais'),
('Copos Descartáveis', 'Copa', 20, 100, 'Embalagens Silva');

-- 4. BLOCO DINÂMICO: GERANDO AGENDA E FINANCEIRO DOS ÚLTIMOS 6 MESES
DO $$
DECLARE
    p_ana UUID;
    p_roberto UUID;
    p_juliana UUID;
    pac_carlos UUID;
    pac_maria UUID;
    pac_joao UUID;
    pac_fernanda UUID;
    pac_rafael UUID;
    pac_laura UUID;
    d DATE;
    dia_semana INT;
BEGIN
    -- Pegando IDs
    SELECT id INTO p_ana FROM profissionais WHERE registro_profissional = 'CRP 01/12345' LIMIT 1;
    SELECT id INTO p_roberto FROM profissionais WHERE registro_profissional = 'CRP 02/54321' LIMIT 1;
    SELECT id INTO p_juliana FROM profissionais WHERE registro_profissional = 'CRP 03/98765' LIMIT 1;

    SELECT id INTO pac_carlos FROM pacientes WHERE email = 'carlos@email.com' LIMIT 1;
    SELECT id INTO pac_maria FROM pacientes WHERE email = 'maria@email.com' LIMIT 1;
    SELECT id INTO pac_joao FROM pacientes WHERE email = 'joao@email.com' LIMIT 1;
    SELECT id INTO pac_fernanda FROM pacientes WHERE email = 'fernanda@email.com' LIMIT 1;
    SELECT id INTO pac_rafael FROM pacientes WHERE email = 'rafael@email.com' LIMIT 1;
    SELECT id INTO pac_laura FROM pacientes WHERE email = 'laura@email.com' LIMIT 1;

    -- Inserir contatos de emergência e anamneses se não existirem
    IF pac_carlos IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_carlos) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_carlos, 'Juliana Drummond', '(11) 91111-2222', 'Cônjuge');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_carlos, 'Sentindo muita pressão no trabalho e sintomas de esgotamento.', '3 meses', 'moderada'::nivel_ansiedade, 'Estável, porém cansado', 'Alto devido ao trabalho', 'Desenvolver estratégias de coping e organizar rotina');
    END IF;

    IF pac_maria IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_maria) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_maria, 'Cláudio Clara', '(11) 92222-3333', 'Pai');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_maria, 'Dificuldade de concentração e desmotivação geral com a carreira.', '6 meses', 'leve'::nivel_ansiedade, 'Oscilante', 'Moderado', 'Trabalhar autoconhecimento e planejamento de carreira');
    END IF;

    IF pac_joao IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_joao) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_joao, 'Marta Pedro', '(11) 93333-4444', 'Mãe');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_joao, 'Dificuldade de socialização na escola e oscilações bruscas de humor.', '1 ano', 'intensa'::nivel_ansiedade, 'Irritadiço', 'Alto na escola', 'Melhorar habilidades sociais e regulação emocional');
    END IF;

    IF pac_fernanda IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_fernanda) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_fernanda, 'Alberto Lima', '(11) 94444-5555', 'Irmão');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_fernanda, 'Insônia crônica e crises recorrentes de ansiedade.', '2 meses', 'intensa'::nivel_ansiedade, 'Ansioso', 'Muito alto', 'Reduzir ansiedade geral e restaurar padrão de sono saudável');
    END IF;

    IF pac_rafael IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_rafael) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_rafael, 'Gisele Souza', '(11) 95555-6666', 'Esposa');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_rafael, 'Processo de transição de carreira gerando muitas dúvidas e insegurança.', '1 mês', 'leve'::nivel_ansiedade, 'Ansioso/Expectante', 'Moderado', 'Trabalhar autoestima e foco profissional');
    END IF;

    IF pac_laura IS NOT NULL AND NOT EXISTS (SELECT 1 FROM anamneses WHERE paciente_id = pac_laura) THEN
        INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao) VALUES (pac_laura, 'Bruno Beatriz', '(11) 96666-7777', 'Marido');
        INSERT INTO anamneses (paciente_id, motivo_consulta, tempo_queixa, ansiedade, humor, estresse, objetivo_terapia)
        VALUES (pac_laura, 'Desejo de iniciar terapia para desenvolvimento pessoal geral e autoconhecimento.', 'N/A', 'leve'::nivel_ansiedade, 'Excelente', 'Baixo', 'Desenvolver inteligência emocional e autoconhecimento');
    END IF;

    -- Limpar dados de teste anteriores para evitar duplicidade ao re-executar
    DELETE FROM agenda WHERE paciente_id IN (pac_carlos, pac_maria, pac_joao, pac_fernanda, pac_rafael, pac_laura);
    DELETE FROM financeiro_receitas WHERE paciente_id IN (pac_carlos, pac_maria, pac_joao, pac_fernanda, pac_rafael, pac_laura);
    DELETE FROM financeiro_despesas WHERE descricao IN ('Aluguel do Consultório', 'Internet / Telefone', 'Material de Escritório', 'Produtos de Limpeza', 'Anúncios Instagram/Google');

    -- Laço para os últimos 150 dias e os próximos 15 dias
    FOR i IN -15..150 LOOP
        d := CURRENT_DATE - i;
        dia_semana := EXTRACT(DOW FROM d);
        
        -- Carlos Drummond (Toda Segunda-feira com Dra. Ana)
        IF dia_semana = 1 AND pac_carlos IS NOT NULL THEN
            INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
            VALUES (d, '09:00', pac_carlos, p_ana, 'presencial', CASE WHEN i <= 0 THEN 'agendado'::status_atendimento ELSE 'realizado'::status_atendimento END);
            
            IF i > 0 THEN -- Passado
                INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                VALUES (d, pac_carlos, 'Sessão Psicoterapia', 'PIX', 150.00, 'pago');
            END IF;
        END IF;

        -- Maria Clara (Toda Quarta-feira com Dr. Roberto)
        IF dia_semana = 3 AND pac_maria IS NOT NULL THEN
            -- Simular uma falta a cada 5 sessões (usando o resto da divisão)
            IF i > 0 AND (i % 5) = 0 THEN
                INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
                VALUES (d, '14:00', pac_maria, p_roberto, 'online', 'faltou'::status_atendimento);
            ELSE
                INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
                VALUES (d, '14:00', pac_maria, p_roberto, 'online', CASE WHEN i <= 0 THEN 'confirmado'::status_atendimento ELSE 'realizado'::status_atendimento END);
                
                IF i > 0 THEN
                    INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                    VALUES (d, pac_maria, 'Psicoterapia Online', 'Cartão de Crédito', 130.00, 'pago');
                END IF;
            END IF;
        END IF;

        -- João Pedro (Toda Sexta-feira com Dra. Juliana)
        IF dia_semana = 5 AND pac_joao IS NOT NULL THEN
            INSERT INTO agenda (data_atendimento, hora_atendimento, paciente_id, profissional_id, tipo, status)
            VALUES (d, '16:00', pac_joao, p_juliana, 'presencial', CASE WHEN i <= 0 THEN 'agendado'::status_atendimento ELSE 'realizado'::status_atendimento END);
            
            IF i > 0 THEN
                INSERT INTO financeiro_receitas (data_receita, paciente_id, servico, forma_pagamento, valor, status)
                VALUES (d, pac_joao, 'Avaliação Infantil', 'Dinheiro', 180.00, 'pago');
            END IF;
        END IF;

        -- Despesas Fixas: Dia 5 do mês
        IF EXTRACT(DAY FROM d) = 5 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor) VALUES (d, 'Aluguel do Consultório', 'Infraestrutura', 1500.00);
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor) VALUES (d, 'Internet / Telefone', 'Infraestrutura', 150.00);
        END IF;

        -- Despesas Variáveis: Dia 20 do mês
        IF EXTRACT(DAY FROM d) = 20 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor) VALUES (d, 'Material de Escritório', 'Papelaria', 80.00);
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor) VALUES (d, 'Produtos de Limpeza', 'Manutenção', 120.00);
        END IF;
        
        IF EXTRACT(DAY FROM d) = 15 THEN
            INSERT INTO financeiro_despesas (data_despesa, descricao, categoria, valor) VALUES (d, 'Anúncios Instagram/Google', 'Marketing', 200.00);
        END IF;
    END LOOP;
END $$;

-- Reativar os triggers de usuário após a inserção dos dados do mock
ALTER TABLE profissionais ENABLE TRIGGER USER;
ALTER TABLE pacientes ENABLE TRIGGER USER;
ALTER TABLE estoque_itens ENABLE TRIGGER USER;
ALTER TABLE agenda ENABLE TRIGGER USER;
ALTER TABLE financeiro_receitas ENABLE TRIGGER USER;
ALTER TABLE financeiro_despesas ENABLE TRIGGER USER;
