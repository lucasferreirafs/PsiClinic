import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT nome_produto, quantidade_atual, quantidade_minima, fornecedor
      FROM vw_lista_estoque_critico
      ORDER BY nome_produto ASC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar estoque crítico:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar estoque crítico" },
      { status: 500 }
    );
  }
}
