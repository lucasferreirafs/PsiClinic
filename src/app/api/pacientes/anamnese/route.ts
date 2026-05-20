import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const ANSIEDADE_VALIDOS = ["leve", "moderada", "intensa"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get("pacienteId");

    if (!pacienteId) {
      return NextResponse.json(
        { success: false, message: "pacienteId é obrigatório" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT
         a.*,
         p.nome_completo,
         p.data_nascimento,
         p.cpf,
         p.telefone,
         p.email,
         p.endereco,
         p.profissao,
         p.estado_civil,
         ce.nome  AS contato_emergencia_nome,
         ce.telefone AS contato_emergencia_telefone,
         ce.relacao  AS contato_emergencia_relacao
       FROM anamneses a
       JOIN pacientes p ON a.paciente_id = p.id
       LEFT JOIN contatos_emergencia ce
         ON ce.paciente_id = p.id AND ce.ativo = TRUE
       WHERE a.paciente_id = $1
         AND a.ativo = TRUE
       LIMIT 1`,
      [pacienteId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0] ?? null,
    });
  } catch (error) {
    console.error("Erro ao buscar anamnese:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar anamnese",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      anamneseId,
      // Campos clínicos da anamnese (direto na tabela)
      mainComplaint,
      problemDuration,
      previousTherapy,
      previousTherapyDetails,
      physicalDiseases,
      medications,
      psychiatricHistory,
      familyMentalHealth,
      familyRelationship,
      sleepQuality,
      eatingHabits,
      substanceUse,
      physicalActivity,
      anxietyLevel,
      moodDescription,
      stressLevel,
      recurrentThoughts,
      therapyGoal,
      psychologistNotes,
    } = body;

    if (!anamneseId) {
      return NextResponse.json(
        { success: false, message: "anamneseId é obrigatório" },
        { status: 400 }
      );
    }

    const ansiedadeValida = anxietyLevel && ANSIEDADE_VALIDOS.includes(anxietyLevel)
      ? anxietyLevel
      : null;

    const fezTerapia =
      previousTherapy === "sim" ? true : previousTherapy === "nao" ? false : null;

    // Atualiza os campos clínicos diretamente na tabela anamneses
    // Os dados pessoais (nome, CPF, telefone, etc.) ficam na tabela pacientes e não são editados aqui
    await pool.query(
      `UPDATE anamneses SET
        motivo_consulta           = COALESCE($2, motivo_consulta),
        tempo_queixa              = $3,
        fez_terapia_antes         = $4,
        tempo_terapia_anterior    = $5,
        doencas_fisicas           = $6,
        uso_medicamentos          = $7,
        historico_psiquiatrico    = $8,
        doencas_mentais_familia   = $9,
        relacao_familiar_desc     = $10,
        habitos_sono              = $11,
        habitos_alimentacao       = $12,
        uso_substancias           = $13,
        atividade_fisica          = $14,
        ansiedade                 = $15::nivel_ansiedade,
        humor                     = $16,
        estresse                  = $17,
        pensamentos_recorrentes   = $18,
        objetivo_terapia          = $19,
        observacoes_psicologo     = $20
      WHERE id = $1 AND ativo = TRUE`,
      [
        anamneseId,
        mainComplaint || null,
        problemDuration || null,
        fezTerapia,
        previousTherapyDetails || null,
        physicalDiseases || null,
        medications || null,
        psychiatricHistory || null,
        familyMentalHealth || null,
        familyRelationship || null,
        sleepQuality || null,
        eatingHabits || null,
        substanceUse || null,
        physicalActivity || null,
        ansiedadeValida,
        moodDescription || null,
        stressLevel || null,
        recurrentThoughts || null,
        therapyGoal || null,
        psychologistNotes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Anamnese atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar anamnese:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar anamnese",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
