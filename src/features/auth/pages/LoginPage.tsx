"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, LockKeyhole } from "lucide-react"
import { toast } from "sonner"

export function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    })
    const json = await res.json()

    if (json.success) {
      toast.success("Login realizado com sucesso!")
      router.push("/dashboard")
    } else {
      toast.error(json.message || "E-mail ou senha inválidos.")
    }

    setIsLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* overlay escuro sutil */}
      <div className="absolute inset-0 bg-[#0F2A4A]/40" />

      <div className="relative w-full max-w-md">
        {/* Cabeçalho acima do card */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 shadow-xl"
            style={{ background: "linear-gradient(135deg, #008DB8, #0F2A4A)" }}
          >
            <Brain className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">PsiClinic</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="h-px w-10 bg-white/40" />
            <p className="text-white/70 text-sm tracking-widest uppercase">
              Sistema de Gestão
            </p>
            <span className="h-px w-10 bg-white/40" />
          </div>
        </div>

        {/* Card glassmorphism */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-2xl rounded-3xl p-8">
          {/* Topo do card */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl mb-3 shadow"
              style={{ background: "linear-gradient(135deg, #008DB8, #0F2A4A)" }}
            >
              <LockKeyhole className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#0F2A4A" }}>
              Bem-vindo de volta
            </h2>
            <p className="text-sm mt-1" style={{ color: "#5C6B7A" }}>
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#0F2A4A" }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#008DB8" }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/60 bg-white/80 text-sm outline-none transition focus:ring-2 focus:ring-[#008DB8]/40 focus:border-[#008DB8] disabled:opacity-50"
                  style={{ color: "#0F2A4A" }}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#0F2A4A" }}
              >
                Senha
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "#008DB8" }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-white/60 bg-white/80 text-sm outline-none transition focus:ring-2 focus:ring-[#008DB8]/40 focus:border-[#008DB8] disabled:opacity-50"
                  style={{ color: "#0F2A4A" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6B7A] hover:text-[#008DB8] transition disabled:opacity-50"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </button>
              </div>
            </div>

            {/* Esqueci senha */}
            <div className="flex justify-end">
              <a
                href="/esqueci-senha"
                className="text-sm hover:underline transition"
                style={{ color: "#008DB8" }}
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 shadow-lg"
              style={{ background: "linear-gradient(135deg, #008DB8, #0F2A4A)" }}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Rodapé do card */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            <LockKeyhole className="h-3.5 w-3.5" style={{ color: "#5C6B7A" }} />
            <p className="text-xs" style={{ color: "#5C6B7A" }}>
              Acesso restrito a administradores autorizados
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
