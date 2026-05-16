import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, nome, registro_profissional, especialidade
       FROM profissionais
       WHERE ativo = TRUE
       ORDER BY nome ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar profissionais",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, registroProfissional, especialidade } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { success: false, message: "O nome do profissional é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_registrar_profissional($1::VARCHAR, $2::VARCHAR, $3::VARCHAR)`,
      [nome.trim(), registroProfissional?.trim() || null, especialidade?.trim() || null]
    );

    return NextResponse.json({
      success: true,
      message: "Profissional cadastrado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao cadastrar profissional",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, registroProfissional, especialidade } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do profissional é obrigatório" },
        { status: 400 }
      );
    }

    if (!nome?.trim()) {
      return NextResponse.json(
        { success: false, message: "O nome do profissional é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_atualizar_profissional($1::UUID, $2::VARCHAR, $3::VARCHAR, $4::VARCHAR)`,
      [id, nome.trim(), registroProfissional?.trim() || null, especialidade?.trim() || null]
    );

    return NextResponse.json({
      success: true,
      message: "Profissional atualizado com sucesso",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro ao atualizar profissional:", msg);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do profissional é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(`CALL sp_inativar_profissional($1::UUID)`, [id]);

    return NextResponse.json({
      success: true,
      message: "Profissional inativado com sucesso",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro ao inativar profissional:", msg);
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
