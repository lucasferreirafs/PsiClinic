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
    const { anamneseId, observacoesPsicologo, objetivoTerapia, ansiedade } =
      body;

    if (!anamneseId) {
      return NextResponse.json(
        { success: false, message: "anamneseId é obrigatório" },
        { status: 400 }
      );
    }

    if (ansiedade && !ANSIEDADE_VALIDOS.includes(ansiedade)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valor de ansiedade inválido. Use: leve, moderada ou intensa",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_atualizar_anamnese($1::UUID, $2::TEXT, $3::TEXT, $4::nivel_ansiedade)`,
      [
        anamneseId,
        observacoesPsicologo || null,
        objetivoTerapia || null,
        ansiedade || null,
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
