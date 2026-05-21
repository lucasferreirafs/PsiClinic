import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT ano, mes, total_receitas, total_despesas, lucro_liquido
      FROM vw_resumo_financeiro_mensal
      ORDER BY ano ASC, mes ASC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar resumo financeiro:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar resumo financeiro" },
      { status: 500 }
    );
  }
}
