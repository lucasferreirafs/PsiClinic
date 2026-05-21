import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  try {
    const useFilter = !!(dataInicio && dataFim);

    const [agendaDiariaResult, statusResult, mensalResult] = await Promise.all([
      pool.query(`
        SELECT hora_atendimento, paciente, profissional, tipo, status
        FROM vw_agenda_diaria
        ORDER BY hora_atendimento ASC
      `),
      useFilter
        ? pool.query(
            `SELECT status, COUNT(*)::int AS total
             FROM agenda
             WHERE ativo = TRUE AND data_atendimento BETWEEN $1 AND $2
             GROUP BY status ORDER BY status`,
            [dataInicio, dataFim]
          )
        : pool.query(
            `SELECT status, COUNT(*)::int AS total
             FROM agenda
             WHERE ativo = TRUE
             GROUP BY status ORDER BY status`
          ),
      useFilter
        ? pool.query(
            `SELECT
               TO_CHAR(DATE_TRUNC('month', data_atendimento), 'MM/YYYY') AS mes,
               SUM(CASE WHEN status = 'realizado'  THEN 1 ELSE 0 END)::int AS realizadas,
               SUM(CASE WHEN status = 'cancelado'  THEN 1 ELSE 0 END)::int AS canceladas,
               SUM(CASE WHEN status = 'faltou'     THEN 1 ELSE 0 END)::int AS faltas
             FROM agenda
             WHERE ativo = TRUE AND data_atendimento BETWEEN $1 AND $2
             GROUP BY DATE_TRUNC('month', data_atendimento)
             ORDER BY DATE_TRUNC('month', data_atendimento) ASC`,
            [dataInicio, dataFim]
          )
        : pool.query(
            `SELECT
               TO_CHAR(DATE_TRUNC('month', data_atendimento), 'MM/YYYY') AS mes,
               SUM(CASE WHEN status = 'realizado'  THEN 1 ELSE 0 END)::int AS realizadas,
               SUM(CASE WHEN status = 'cancelado'  THEN 1 ELSE 0 END)::int AS canceladas,
               SUM(CASE WHEN status = 'faltou'     THEN 1 ELSE 0 END)::int AS faltas
             FROM agenda
             WHERE ativo = TRUE
             GROUP BY DATE_TRUNC('month', data_atendimento)
             ORDER BY DATE_TRUNC('month', data_atendimento) ASC`
          ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        agendaDiaria: agendaDiariaResult.rows,
        porStatus: statusResult.rows.map((r) => ({
          status: r.status,
          total: Number(r.total),
        })),
        mensal: mensalResult.rows.map((r) => ({
          mes: r.mes,
          realizadas: Number(r.realizadas),
          canceladas: Number(r.canceladas),
          faltas: Number(r.faltas),
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar relatório de agenda:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar relatório de agenda" },
      { status: 500 }
    );
  }
}
