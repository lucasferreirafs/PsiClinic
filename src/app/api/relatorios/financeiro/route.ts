import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT ano, mes, total_receitas, total_despesas, lucro_liquido
      FROM vw_resumo_financeiro_mensal
      ORDER BY ano ASC, mes ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows.map((r) => ({
        ano: Number(r.ano),
        mes: Number(r.mes),
        totalReceitas: Number(r.total_receitas),
        totalDespesas: Number(r.total_despesas),
        lucroLiquido: Number(r.lucro_liquido),
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar relatório financeiro:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar relatório financeiro" },
      { status: 500 }
    );
  }
}
