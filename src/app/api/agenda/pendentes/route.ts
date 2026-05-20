import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        TO_CHAR(a.data_atendimento, 'YYYY-MM-DD') AS data_atendimento,
        a.hora_atendimento::TEXT                  AS hora_atendimento,
        a.tipo,
        a.status,
        a.observacoes,
        p.id            AS paciente_id,
        p.nome_completo AS paciente,
        prof.id         AS profissional_id,
        prof.nome       AS profissional
      FROM agenda a
      JOIN pacientes     p    ON a.paciente_id     = p.id
      JOIN profissionais prof ON a.profissional_id = prof.id
      WHERE a.ativo = TRUE
        AND (
          -- Qualquer consulta agendada ou confirmada que já passou
          (a.status IN ('agendado', 'confirmado') AND a.data_atendimento < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date)
          OR (a.status IN ('agendado', 'confirmado') AND a.data_atendimento = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date AND a.hora_atendimento < (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::time)
          -- Consultas com status 'agendado' que acontecem hoje nas próximas 2 horas (pendentes de confirmação)
          OR (a.status = 'agendado' AND a.data_atendimento = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::date AND a.hora_atendimento >= (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::time AND a.hora_atendimento <= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::time + INTERVAL '2 hours'))
        )
      ORDER BY a.data_atendimento ASC, a.hora_atendimento ASC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar atendimentos pendentes:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar atendimentos pendentes" },
      { status: 500 }
    );
  }
}

