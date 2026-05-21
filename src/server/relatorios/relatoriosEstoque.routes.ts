import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [criticoResult, resumoResult, categoriasResult] = await Promise.all([
      pool.query(`
        SELECT nome_produto, quantidade_atual, quantidade_minima, fornecedor
        FROM vw_lista_estoque_critico
        ORDER BY nome_produto ASC
      `),
      pool.query(`
        SELECT
          COUNT(*)::int AS total_itens,
          COUNT(*) FILTER (WHERE fn_verificar_status_estoque(id) = 'CRÍTICO')::int AS total_criticos,
          COALESCE(SUM(quantidade_atual), 0)::int AS quantidade_total
        FROM estoque_itens
        WHERE ativo = TRUE
      `),
      pool.query(`
        SELECT
          COALESCE(categoria, 'Outros') AS categoria,
          SUM(quantidade_atual)::int AS quantidade
        FROM estoque_itens
        WHERE ativo = TRUE
        GROUP BY COALESCE(categoria, 'Outros')
        ORDER BY quantidade DESC
      `),
    ]);

    const resumo = resumoResult.rows[0] ?? { total_itens: 0, total_criticos: 0, quantidade_total: 0 };

    return NextResponse.json({
      success: true,
      data: {
        resumo: {
          totalItens: Number(resumo.total_itens),
          totalCriticos: Number(resumo.total_criticos),
          quantidadeTotal: Number(resumo.quantidade_total),
        },
        categorias: categoriasResult.rows.map((r) => ({
          name: r.categoria,
          value: Number(r.quantidade),
        })),
        itensCriticos: criticoResult.rows.map((r) => ({
          nomeProduto: r.nome_produto,
          quantidadeAtual: Number(r.quantidade_atual),
          quantidadeMinima: Number(r.quantidade_minima),
          fornecedor: r.fornecedor,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar relatório de estoque:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar relatório de estoque" },
      { status: 500 }
    );
  }
}
