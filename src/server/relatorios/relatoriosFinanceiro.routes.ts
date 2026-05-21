import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  const thisYear = new Date().getFullYear();
  const start = dataInicio || `${thisYear}-01-01`;
  const end = dataFim || `${thisYear}-12-31`;

  try {
    const [mensalResult, transacoesResult] = await Promise.all([
      pool.query(`
        SELECT ano, mes, total_receitas, total_despesas, lucro_liquido
        FROM vw_resumo_financeiro_mensal
        ORDER BY ano ASC, mes ASC
      `),
      pool.query(`
        SELECT 
          'receita' AS tipo,
          fr.id,
          fr.data_receita::text AS data,
          fr.servico AS descricao,
          fr.forma_pagamento AS categoria_info,
          fr.valor,
          p.nome_completo AS paciente
        FROM financeiro_receitas fr
        LEFT JOIN pacientes p ON fr.paciente_id = p.id
        WHERE fr.ativo = TRUE AND fr.data_receita BETWEEN $1 AND $2

        UNION ALL

        SELECT 
          'despesa' AS tipo,
          fd.id,
          fd.data_despesa::text AS data,
          fd.descricao,
          fd.categoria AS categoria_info,
          fd.valor,
          NULL AS paciente
        FROM financeiro_despesas fd
        WHERE fd.ativo = TRUE AND fd.data_despesa BETWEEN $1 AND $2

        ORDER BY data DESC, id DESC
      `, [start, end])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        mensal: mensalResult.rows.map((r) => ({
          ano: Number(r.ano),
          mes: Number(r.mes),
          totalReceitas: Number(r.total_receitas),
          totalDespesas: Number(r.total_despesas),
          lucroLiquido: Number(r.lucro_liquido),
        })),
        transacoes: transacoesResult.rows.map((r) => ({
          tipo: r.tipo,
          id: r.id,
          data: r.data,
          descricao: r.descricao,
          categoriaInfo: r.categoria_info,
          valor: Number(r.valor),
          paciente: r.paciente,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar relatório financeiro:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar relatório financeiro" },
      { status: 500 }
    );
  }
}

