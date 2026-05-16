import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const TIPOS_VALIDOS = ["presencial", "online"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data") ?? null;

    const result = await pool.query(
      `SELECT
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
       JOIN pacientes    p    ON a.paciente_id    = p.id
       JOIN profissionais prof ON a.profissional_id = prof.id
       WHERE a.ativo = TRUE
         AND ($1::date IS NULL OR a.data_atendimento = $1::date)
       ORDER BY a.data_atendimento ASC, a.hora_atendimento ASC`,
      [data]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar agenda",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      dataAtendimento,
      horaAtendimento,
      pacienteId,
      profissionalId,
      tipo,
      observacoes,
    } = body;

    if (!dataAtendimento || !horaAtendimento || !pacienteId || !profissionalId || !tipo) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { success: false, message: "Tipo inválido. Use: presencial ou online" },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_agendar_atendimento($1::DATE, $2::TIME, $3::UUID, $4::UUID, $5::tipo_atendimento, $6::TEXT)`,
      [
        dataAtendimento,
        horaAtendimento,
        pacienteId,
        profissionalId,
        tipo,
        observacoes ?? null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Atendimento agendado com sucesso",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Erro ao agendar atendimento:", msg);

    if (msg.includes("Conflito de agenda")) {
      return NextResponse.json(
        { success: false, message: msg },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Erro ao agendar atendimento", error: msg },
      { status: 500 }
    );
  }
}
