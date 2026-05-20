import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const result = await pool.query(
        `SELECT 
           p.id, p.nome_completo, p.data_nascimento, p.cpf, p.telefone, p.email, p.endereco, p.profissao, p.estado_civil,
           ce.nome AS contato_emergencia_nome,
           ce.telefone AS contato_emergencia_telefone,
           ce.relacao AS contato_emergencia_relacao
         FROM pacientes p
         LEFT JOIN contatos_emergencia ce ON ce.paciente_id = p.id AND ce.ativo = TRUE
         WHERE p.id = $1 AND p.ativo = TRUE`,
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Paciente não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: result.rows[0] });
    }

    const result = await pool.query(
      `SELECT id, nome_completo, email, telefone, idade
       FROM vw_pacientes_ativos
       ORDER BY nome_completo ASC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar pacientes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao buscar pacientes",
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
      nomeCompleto,
      dataNascimento,
      cpf,
      telefone,
      email,
      endereco,
      profissao,
      estadoCivil,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      contatoEmergenciaRelacao,
      motivoConsulta,
      tempoQueixa,
    } = body;

    if (
      !nomeCompleto ||
      !dataNascimento ||
      !cpf ||
      !telefone ||
      !email ||
      !contatoEmergenciaNome ||
      !contatoEmergenciaTelefone ||
      !contatoEmergenciaRelacao ||
      !motivoConsulta
    ) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    await pool.query(
      `CALL sp_registrar_paciente_completo($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        nomeCompleto,
        dataNascimento,
        cpf,
        telefone,
        email,
        endereco || null,
        profissao || null,
        estadoCivil || null,
        contatoEmergenciaNome,
        contatoEmergenciaTelefone,
        contatoEmergenciaRelacao,
        motivoConsulta,
        tempoQueixa || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Paciente cadastrado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao cadastrar paciente:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao cadastrar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      nomeCompleto,
      dataNascimento,
      cpf,
      telefone,
      email,
      endereco,
      profissao,
      estadoCivil,
      contatoEmergenciaNome,
      contatoEmergenciaTelefone,
      contatoEmergenciaRelacao,
    } = body;

    if (!id || !nomeCompleto || !dataNascimento || !cpf || !telefone || !email) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      
      await client.query(
        `UPDATE pacientes 
         SET nome_completo = $1, data_nascimento = $2, cpf = $3, telefone = $4, 
             email = $5, endereco = $6, profissao = $7, estado_civil = $8,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [nomeCompleto, dataNascimento, cpf, telefone, email, endereco || null, profissao || null, estadoCivil || null, id]
      );

      const contactCheck = await client.query(
        `SELECT id FROM contatos_emergencia WHERE paciente_id = $1 AND ativo = TRUE`,
        [id]
      );

      if (contactCheck.rows.length > 0) {
        await client.query(
          `UPDATE contatos_emergencia 
           SET nome = $1, telefone = $2, relacao = $3, atualizado_em = CURRENT_TIMESTAMP
           WHERE paciente_id = $4 AND ativo = TRUE`,
          [contatoEmergenciaNome, contatoEmergenciaTelefone, contatoEmergenciaRelacao, id]
        );
      } else {
        await client.query(
          `INSERT INTO contatos_emergencia (paciente_id, nome, telefone, relacao)
           VALUES ($1, $2, $3, $4)`,
          [id, contatoEmergenciaNome, contatoEmergenciaTelefone, contatoEmergenciaRelacao]
        );
      }

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({
      success: true,
      message: "Paciente atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar paciente:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar paciente",
        error: error instanceof Error ? error.message : String(error),
      },
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
        { success: false, message: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    await pool.query(`UPDATE pacientes SET ativo = FALSE WHERE id = $1`, [id]);

    return NextResponse.json({
      success: true,
      message: "Paciente excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir paciente:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao excluir paciente",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
