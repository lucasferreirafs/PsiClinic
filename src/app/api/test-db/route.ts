import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW() as agora");

    return NextResponse.json({
      success: true,
      message: "Conexão com o banco funcionando!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao conectar no banco:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Erro ao conectar no banco",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
