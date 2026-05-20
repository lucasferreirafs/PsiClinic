import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [statsResult, mensalResult] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int AS total,
          COALESCE(ROUND(AVG(idade))::int, 0) AS media_idade,
          COALESCE(MIN(idade), 0)::int AS menor_idade,
          COALESCE(MAX(idade), 0)::int AS maior_idade
        FROM vw_pacientes_ativos
      `),
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', criado_em), 'MM/YYYY') AS mes,
          COUNT(*)::int AS novos
        FROM pacientes
        WHERE ativo = TRUE
        GROUP BY DATE_TRUNC('month', criado_em)
        ORDER BY DATE_TRUNC('month', criado_em) ASC
      `),
    ]);

    const stats = statsResult.rows[0] ?? { total: 0, media_idade: 0, menor_idade: 0, maior_idade: 0 };

    return NextResponse.json({
      success: true,
      data: {
        estatisticas: {
          total: Number(stats.total),
          mediaIdade: Number(stats.media_idade),
          menorIdade: Number(stats.menor_idade),
          maiorIdade: Number(stats.maior_idade),
        },
        mensais: mensalResult.rows.map((r) => ({
          mes: r.mes,
          novos: Number(r.novos),
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar relatório de pacientes:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar relatório de pacientes" },
      { status: 500 }
    );
  }
}
