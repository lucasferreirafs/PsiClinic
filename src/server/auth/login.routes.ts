import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { comparePassword, signJwt } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, senha } = body

    if (!email || !senha) {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    const result = await pool.query(
      `SELECT id, nome, email, perfil, senha_hash
       FROM usuarios
       WHERE email = $1 AND ativo = TRUE`,
      [email.trim().toLowerCase()]
    )

    if (result.rows.length === 0 || !result.rows[0].senha_hash) {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    const valid = await comparePassword(senha, user.senha_hash)

    if (!valid) {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha inválidos." },
        { status: 401 }
      )
    }

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      nome: user.nome,
      perfil: user.perfil,
    })

    await pool.query(`UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1`, [user.id])

    const response = NextResponse.json({
      success: true,
      message: "Login realizado com sucesso",
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    })

    response.cookies.set("psiclinic_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json(
      { success: false, message: "Erro interno. Tente novamente." },
      { status: 500 }
    )
  }
}
