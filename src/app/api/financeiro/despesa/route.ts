import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        data_despesa,
        descricao,
        categoria,
        valor
      FROM financeiro_despesas
      WHERE ativo = TRUE
      ORDER BY data_despesa DESC, criado_em DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar despesas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar despesas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descricao, categoria, valor } = body;

    if (!descricao || valor === undefined || valor === null) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes: descricao, valor" },
        { status: 400 }
      );
    }

    if (typeof valor !== "number" || valor < 0) {
      return NextResponse.json(
        { success: false, message: "Valor deve ser um número maior ou igual a 0" },
        { status: 400 }
      );
    }

    if (!String(descricao).trim()) {
      return NextResponse.json(
        { success: false, message: "Descrição não pode ser vazia" },
        { status: 400 }
      );
    }

    await pool.query(
      "CALL sp_registrar_despesa($1, $2, $3)",
      [descricao, categoria ?? null, valor]
    );

    return NextResponse.json({ success: true, message: "Despesa registrada com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar despesa:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao registrar despesa" },
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
        { success: false, message: "ID da despesa é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(`UPDATE financeiro_despesas SET ativo = FALSE WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "Despesa excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao excluir despesa" },
      { status: 500 }
    );
  }
}
