import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nome_produto,
        categoria,
        quantidade_atual,
        quantidade_minima,
        fornecedor,
        criado_em::DATE AS data_entrada,
        fn_verificar_status_estoque(id) AS status_estoque
      FROM estoque_itens
      WHERE ativo = TRUE
      ORDER BY nome_produto ASC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar estoque:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar estoque" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomeProduto, categoria, quantidadeAtual, quantidadeMinima, fornecedor } = body;

    if (!nomeProduto || !String(nomeProduto).trim()) {
      return NextResponse.json(
        { success: false, message: "Nome do produto é obrigatório" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO estoque_itens (nome_produto, categoria, quantidade_atual, quantidade_minima, fornecedor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        nomeProduto,
        categoria ?? null,
        Number(quantidadeAtual) || 0,
        Number(quantidadeMinima) || 0,
        fornecedor ?? null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Item cadastrado com sucesso",
      id: result.rows[0]?.id,
    });
  } catch (error) {
    console.error("Erro ao cadastrar item:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao cadastrar item" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, nomeProduto, categoria, quantidadeMinima, fornecedor } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID do item é obrigatório" },
        { status: 400 }
      );
    }
    if (!nomeProduto || !String(nomeProduto).trim()) {
      return NextResponse.json(
        { success: false, message: "Nome do produto é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE estoque_itens
       SET nome_produto = $1, categoria = $2, quantidade_minima = $3, fornecedor = $4, atualizado_em = NOW()
       WHERE id = $5 AND ativo = TRUE`,
      [nomeProduto, categoria ?? null, Number(quantidadeMinima) || 0, fornecedor ?? null, id]
    );

    return NextResponse.json({ success: true, message: "Item atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar item" },
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
        { success: false, message: "ID do item é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE estoque_itens SET ativo = FALSE, atualizado_em = NOW() WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ success: true, message: "Item removido do estoque" });
  } catch (error) {
    console.error("Erro ao remover item:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao remover item" },
      { status: 500 }
    );
  }
}
