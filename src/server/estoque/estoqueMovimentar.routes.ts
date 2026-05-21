import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, tipo, quantidade, observacao } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "itemId é obrigatório" },
        { status: 400 }
      );
    }

    if (!tipo || !["entrada", "saida"].includes(tipo)) {
      return NextResponse.json(
        { success: false, message: "Tipo inválido. Use: entrada ou saida" },
        { status: 400 }
      );
    }

    if (
      typeof quantidade !== "number" ||
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      return NextResponse.json(
        { success: false, message: "Quantidade deve ser um número inteiro positivo" },
        { status: 400 }
      );
    }

    await pool.query(
      "CALL sp_movimentar_estoque($1, $2, $3, $4)",
      [itemId, tipo, quantidade, observacao ?? null]
    );

    return NextResponse.json({ success: true, message: "Movimentação registrada com sucesso" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    if (lower.includes("estoque insuficiente")) {
      return NextResponse.json(
        { success: false, message: "Estoque insuficiente para realizar esta saída." },
        { status: 409 }
      );
    }
    if (lower.includes("tipo de movimentação inválido") || lower.includes("tipo de movimentacao invalido")) {
      return NextResponse.json(
        { success: false, message: "Tipo de movimentação inválido. Use: entrada ou saida." },
        { status: 400 }
      );
    }
    if (lower.includes("item de estoque não encontrado") || lower.includes("item de estoque nao encontrado")) {
      return NextResponse.json(
        { success: false, message: "Item de estoque não encontrado ou inativo." },
        { status: 400 }
      );
    }

    console.error("Erro ao movimentar estoque:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao registrar movimentação" },
      { status: 500 }
    );
  }
}
