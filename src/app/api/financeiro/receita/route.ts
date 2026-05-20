import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        fr.id,
        fr.data_receita,
        fr.servico,
        fr.forma_pagamento,
        fr.valor,
        fr.status,
        p.nome_completo AS paciente
      FROM financeiro_receitas fr
      LEFT JOIN pacientes p ON fr.paciente_id = p.id
      WHERE fr.ativo = TRUE
      ORDER BY fr.data_receita DESC, fr.criado_em DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar receitas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pacienteId, servico, formaPagamento, valor } = body;

    if (!pacienteId || !servico || valor === undefined || valor === null) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes: pacienteId, servico, valor" },
        { status: 400 }
      );
    }

    if (typeof valor !== "number" || valor < 0) {
      return NextResponse.json(
        { success: false, message: "Valor deve ser um número maior ou igual a 0" },
        { status: 400 }
      );
    }

    if (!String(servico).trim()) {
      return NextResponse.json(
        { success: false, message: "Serviço não pode ser vazio" },
        { status: 400 }
      );
    }

    await pool.query(
      "CALL sp_registrar_receita($1, $2, $3, $4)",
      [pacienteId, servico, formaPagamento ?? null, valor]
    );

    const selectResult = await pool.query(
      `SELECT id FROM financeiro_receitas
       WHERE paciente_id = $1 AND servico = $2 AND ativo = TRUE
       ORDER BY criado_em DESC LIMIT 1`,
      [pacienteId, servico]
    );
    const newId = selectResult.rows[0]?.id ?? null;

    return NextResponse.json({ success: true, message: "Receita registrada com sucesso", id: newId });
  } catch (error) {
    console.error("Erro ao registrar receita:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao registrar receita" },
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
        { success: false, message: "ID da receita é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(`UPDATE financeiro_receitas SET ativo = FALSE WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "Receita excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao excluir receita" },
      { status: 500 }
    );
  }
}
