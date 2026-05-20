import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        nome,
        email,
        perfil,
        TO_CHAR(criado_em, 'YYYY-MM-DD') AS criado_em
      FROM usuarios
      WHERE ativo = TRUE
      ORDER BY nome ASC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, perfil } = body;

    if (!nome || !email || !perfil) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes: nome, email, perfil" },
        { status: 400 }
      );
    }

    if (!["dono", "admin"].includes(perfil)) {
      return NextResponse.json(
        { success: false, message: "Perfil inválido. Use: dono ou admin" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, perfil) VALUES ($1, $2, $3) RETURNING id`,
      [nome.trim(), email.trim().toLowerCase(), perfil]
    );

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      id: result.rows[0].id,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está cadastrado" },
        { status: 409 }
      );
    }
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao criar usuário" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nome, email, perfil } = body;

    if (!id || !nome || !email || !perfil) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios ausentes: id, nome, email, perfil" },
        { status: 400 }
      );
    }

    if (!["dono", "admin"].includes(perfil)) {
      return NextResponse.json(
        { success: false, message: "Perfil inválido. Use: dono ou admin" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE usuarios SET nome = $1, email = $2, perfil = $3 WHERE id = $4 AND ativo = TRUE`,
      [nome.trim(), email.trim().toLowerCase(), perfil, id]
    );

    return NextResponse.json({ success: true, message: "Usuário atualizado com sucesso" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está em uso por outro usuário" },
        { status: 409 }
      );
    }
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao atualizar usuário" },
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
        { success: false, message: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const check = await pool.query(
      `SELECT perfil FROM usuarios WHERE id = $1 AND ativo = TRUE`,
      [id]
    );

    if (check.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (check.rows[0].perfil === "dono") {
      return NextResponse.json(
        { success: false, message: "Não é possível excluir o usuário proprietário" },
        { status: 403 }
      );
    }

    await pool.query(`UPDATE usuarios SET ativo = FALSE WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno ao excluir usuário" },
      { status: 500 }
    );
  }
}
