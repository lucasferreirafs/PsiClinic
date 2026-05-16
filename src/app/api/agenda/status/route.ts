import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const ACOES_VALIDAS = ["confirmar", "cancelar", "realizar", "falta"] as const;
type Acao = (typeof ACOES_VALIDAS)[number];

const SP_MAP: Record<Acao, string> = {
  confirmar: "sp_confirmar_atendimento",
  cancelar: "sp_cancelar_atendimento",
  realizar: "sp_marcar_atendimento_realizado",
  falta: "sp_marcar_falta_atendimento",
};

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { agendaId, acao } = body;

    if (!agendaId) {
      return NextResponse.json(
        { success: false, message: "agendaId é obrigatório" },
        { status: 400 }
      );
    }

    if (!acao || !ACOES_VALIDAS.includes(acao)) {
      return NextResponse.json(
        {
          success: false,
          message: `Ação inválida. Use: ${ACOES_VALIDAS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const sp = SP_MAP[acao as Acao];
    await pool.query(`CALL ${sp}($1::UUID)`, [agendaId]);

    return NextResponse.json({
      success: true,
      message: "Status atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar status",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
