import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT hora_atendimento, paciente, profissional, tipo, status
       FROM vw_agenda_diaria
       ORDER BY hora_atendimento ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar agenda diária:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar agenda diária",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
