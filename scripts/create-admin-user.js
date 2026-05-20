const path = require("path")
const fs = require("fs")

function loadEnvFile(filename) {
  const envPath = path.resolve(__dirname, "..", filename)
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, "utf8").split("\n")
  for (const line of lines) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^['"]|['"]$/g, "")
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnvFile(".env.local")
loadEnvFile(".env")

const { Pool } = require("pg")
const bcrypt = require("bcryptjs")

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@psiclinic.com"
  const nome = process.env.ADMIN_NOME || "Administrador"
  const senha = process.env.ADMIN_PASSWORD

  if (!senha) {
    console.error("Erro: ADMIN_PASSWORD não definido em .env.local")
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error("Erro: DATABASE_URL não definido em .env.local")
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    const senhaHash = await bcrypt.hash(senha, 12)
    await pool.query(
      `INSERT INTO usuarios (nome, email, perfil, senha_hash)
       VALUES ($1, $2, 'dono', $3)
       ON CONFLICT (email) DO UPDATE
         SET senha_hash = EXCLUDED.senha_hash,
             ativo = TRUE`,
      [nome, email.toLowerCase(), senhaHash]
    )
    console.log(`✓ Usuário administrador criado/atualizado: ${email}`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error("Erro ao criar usuário admin:", err.message)
  process.exit(1)
})
