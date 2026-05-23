import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return false
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("psiclinic_token")?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/dashboard")) {
    if (!token || !(await isValidToken(token))) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  if(pathname === "/login") {
    if(token && (await isValidToken(token))){
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
