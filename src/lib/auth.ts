import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

export type JwtPayload = {
  sub: string
  email: string
  nome: string
  perfil: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET não configurado")
  const key = new TextEncoder().encode(secret)
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key)
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return null
    const key = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}
