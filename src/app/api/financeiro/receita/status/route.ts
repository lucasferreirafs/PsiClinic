import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const VALID_STATUSES = ["pago", "pendente", "cancelado"] as const;
type StatusPagamento = (typeof VALID_STATUSES)[number];

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { receitaId, status } = body;

    if (!receitaId) {
      return NextResponse.json(
        { success: false, message: "receitaId é obrigatório" },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status as StatusPagamento)) {
      return NextResponse.json(
        { success: false, message: "Status inválido. Use: pago, pendente ou cancelado" },
        { status: 400 }
      );
    }

    await pool.query(
      "CALL sp_atualizar_status_pagamento($1, $2::status_pagamento)",
      [receitaId, status]
    );

    return NextResponse.json({ success: true, message: "Status atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar status" },
      { status: 500 }
    );
  }
}
