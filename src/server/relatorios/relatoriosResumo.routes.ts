import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  try {
    const [pacientesRes, agendaRes, estoqueRes, financeiroRes] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS total_pacientes FROM vw_pacientes_ativos"),
      pool.query("SELECT COUNT(*)::int AS total_atendimentos_dia FROM vw_agenda_diaria"),
      pool.query("SELECT COUNT(*)::int AS total_estoque_critico FROM vw_lista_estoque_critico"),
      pool.query(`
        SELECT ano, mes, total_receitas, total_despesas, lucro_liquido
        FROM vw_resumo_financeiro_mensal
        ORDER BY ano DESC, mes DESC
        LIMIT 1
      `),
    ]);

    let lucroLiquidoPeriodo = 0;
    if (dataInicio && dataFim) {
      const lucroRes = await pool.query(
        "SELECT fn_calcular_lucro_liquido($1, $2) AS lucro_liquido",
        [dataInicio, dataFim]
      );
      lucroLiquidoPeriodo = Number(lucroRes.rows[0]?.lucro_liquido ?? 0);
    }

    const fin = financeiroRes.rows[0] ?? null;

    return NextResponse.json({
      success: true,
      data: {
        totalPacientes: pacientesRes.rows[0]?.total_pacientes ?? 0,
        totalAtendimentosDia: agendaRes.rows[0]?.total_atendimentos_dia ?? 0,
        totalEstoqueCritico: estoqueRes.rows[0]?.total_estoque_critico ?? 0,
        financeiroMensal: fin
          ? {
              ano: Number(fin.ano),
              mes: Number(fin.mes),
              totalReceitas: Number(fin.total_receitas),
              totalDespesas: Number(fin.total_despesas),
              lucroLiquido: Number(fin.lucro_liquido),
            }
          : { ano: 0, mes: 0, totalReceitas: 0, totalDespesas: 0, lucroLiquido: 0 },
        lucroLiquidoPeriodo,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de relatórios:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar resumo" },
      { status: 500 }
    );
  }
}
