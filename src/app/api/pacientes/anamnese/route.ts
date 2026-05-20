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

    await pool.query(
      `CALL sp_atualizar_anamnese_completa($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::nivel_ansiedade, $16, $17, $18, $19, $20)`,
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
