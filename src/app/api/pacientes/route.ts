import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nome_completo, email, telefone, idade
       FROM vw_pacientes_ativos
       ORDER BY nome_completo ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar pacientes",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nomeCompleto,
      dataNascimento,
      cpf,
      telefone,
      email,
      endereco,
      profissao,
      estadoCivil,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      contatoEmergenciaRelacao,
      motivoConsulta,
      tempoQueixa,
    } = body;

    if (
      !nomeCompleto ||
      !dataNascimento ||
      !cpf ||
      !telefone ||
      !email ||
      !contatoEmergenciaNome ||
      !contatoEmergenciaTelefone ||
      !contatoEmergenciaRelacao ||
      !motivoConsulta
    ) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_registrar_paciente_completo($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        nomeCompleto,
        dataNascimento,
        cpf,
        telefone,
        email,
        endereco || null,
        profissao || null,
        estadoCivil || null,
        contatoEmergenciaNome,
        contatoEmergenciaTelefone,
        contatoEmergenciaRelacao,
        motivoConsulta,
        tempoQueixa || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Paciente cadastrado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao cadastrar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
