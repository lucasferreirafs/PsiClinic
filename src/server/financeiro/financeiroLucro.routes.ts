import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  if (!dataInicio || !dataFim) {
    return NextResponse.json(
      { success: false, message: "Parâmetros obrigatórios: dataInicio, dataFim" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      "SELECT fn_calcular_lucro_liquido($1, $2) AS lucro_liquido",
      [dataInicio, dataFim]
    );

    const lucroLiquido = Number(result.rows[0]?.lucro_liquido ?? 0);

    return NextResponse.json({ success: true, data: { lucroLiquido } });
  } catch (error) {
    console.error("Erro ao calcular lucro líquido:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao calcular lucro líquido" },
      { status: 500 }
    );
  }
}
