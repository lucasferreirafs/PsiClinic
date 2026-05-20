import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwt } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("psiclinic_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Não autenticado" },
        { status: 401 }
      )
    }

    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Token inválido ou expirado" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        perfil: payload.perfil,
      },
    })
  } catch (error) {
    console.error("Erro em /api/auth/me:", error)
    return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}
