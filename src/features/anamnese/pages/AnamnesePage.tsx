"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Save,
  User,
  Phone,
  Heart,
  Brain,
  Target,
  FileText,
  AlertCircle,
  Loader2,
  Search,
  ChevronRight,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

function calcularIdade(dataNascimento: string): string {
  if (!dataNascimento) return ""
  const today = new Date()
  const birth = new Date(dataNascimento)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return String(age)
}

const formatCPF = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 11)
  if (v.length <= 3) return v
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
}

const formatPhone = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 11)
  if (v.length <= 2) return v
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
}

type Patient = {
  id: string
  nome_completo: string
  cpf: string
  email: string
  telefone: string
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Componente: SeleÃ§Ã£o de Paciente
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PatientSelector({ onSelect }: { onSelect: (p: Patient) => void }) {
  const [search, setSearch] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/pacientes")
        const json = await res.json()
        if (json.success) setPatients(json.data)
      } catch {
        toast.error("Erro ao carregar lista de pacientes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = patients.filter((p) =>
    p.nome_completo.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf && p.cpf.replace(/\D/g, "").includes(search.replace(/\D/g, "")))
  )

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ficha de Anamnese</h1>
        <p className="text-muted-foreground">
          Selecione o paciente para acessar ou preencher a ficha de anamnese.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Selecionar Paciente
          </CardTitle>
          <CardDescription>
            Busque pelo nome ou CPF do paciente cadastrado no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="pl-9"
              autoFocus
            />
          </div>

          {loading ? (
            <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando pacientes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {search ? "Nenhum paciente encontrado para a busca." : "Nenhum paciente cadastrado."}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/60 hover:bg-primary/5 transition-all text-left group"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getInitials(p.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.nome_completo}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.cpf ? formatCPF(p.cpf) : "CPF nÃ£o informado"} â€¢ {p.email || "E-mail nÃ£o informado"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}

          {patients.length > 0 && !search && (
            <p className="text-xs text-muted-foreground text-right">
              {patients.length} paciente{patients.length !== 1 ? "s" : ""} cadastrado{patients.length !== 1 ? "s" : ""}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Componente: FormulÃ¡rio de Anamnese
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnamneseFormContent({ patientId }: { patientId: string }) {
  const [anamneseId, setAnamneseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("dados-pessoais")

  // Dados pessoais (somente leitura â€” vÃªm do cadastro do paciente)
  const [personalData, setPersonalData] = useState({
    nome_completo: "",
    data_nascimento: "",
    age: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    profissao: "",
    estado_civil: "",
    contato_emergencia_nome: "",
    contato_emergencia_telefone: "",
    contato_emergencia_relacao: "",
  })

  // Dados clÃ­nicos (editÃ¡veis)
  const [clinicalData, setClinicalData] = useState({
    mainComplaint: "",
    problemDuration: "",
    previousTherapy: "",
    previousTherapyDetails: "",
    physicalDiseases: "",
    medications: "",
    psychiatricHistory: "",
    familyMentalHealth: "",
    familyRelationship: "",
    sleepQuality: "",
    eatingHabits: "",
    substanceUse: "",
    physicalActivity: "",
    anxietyLevel: "",
    moodDescription: "",
    stressLevel: "",
    recurrentThoughts: "",
    therapyGoal: "",
    psychologistNotes: "",
  })

  const fetchAnamnese = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pacientes/anamnese?pacienteId=${patientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        setAnamneseId(d.id)

        // Dados pessoais (readonly) vindos do paciente
        setPersonalData({
          nome_completo: d.nome_completo ?? "",
          data_nascimento: d.data_nascimento ? d.data_nascimento.split("T")[0] : "",
          age: d.data_nascimento ? calcularIdade(d.data_nascimento.split("T")[0]) : "",
          cpf: d.cpf ? formatCPF(d.cpf.trim()) : "",
          telefone: d.telefone ? formatPhone(d.telefone) : "",
          email: d.email ?? "",
          endereco: d.endereco ?? "",
          profissao: d.profissao ?? "",
          estado_civil: d.estado_civil ?? "",
          contato_emergencia_nome: d.contato_emergencia_nome ?? "",
          contato_emergencia_telefone: d.contato_emergencia_telefone
            ? formatPhone(d.contato_emergencia_telefone)
            : "",
          contato_emergencia_relacao: d.contato_emergencia_relacao ?? "",
        })

        // Dados clÃ­nicos (editÃ¡veis) vindos da anamnese
        setClinicalData({
          mainComplaint: d.motivo_consulta ?? "",
          problemDuration: d.tempo_queixa ?? "",
          previousTherapy:
            d.fez_terapia_antes === true ? "sim" : d.fez_terapia_antes === false ? "nao" : "",
          previousTherapyDetails: d.tempo_terapia_anterior ?? "",
          physicalDiseases: d.doencas_fisicas ?? "",
          medications: d.uso_medicamentos ?? "",
          psychiatricHistory: d.historico_psiquiatrico ?? "",
          familyMentalHealth: d.doencas_mentais_familia ?? "",
          familyRelationship: d.relacao_familiar_desc ?? "",
          sleepQuality: d.habitos_sono ?? "",
          eatingHabits: d.habitos_alimentacao ?? "",
          substanceUse: d.uso_substancias ?? "",
          physicalActivity: d.atividade_fisica ?? "",
          anxietyLevel: d.ansiedade ?? "",
          moodDescription: d.humor ?? "",
          stressLevel: d.estresse ?? "",
          recurrentThoughts: d.pensamentos_recorrentes ?? "",
          therapyGoal: d.objetivo_terapia ?? "",
          psychologistNotes: d.observacoes_psicologo ?? "",
        })
      } else {
        toast.error("Anamnese nÃ£o encontrada para este paciente.")
      }
    } catch {
      toast.error("Erro ao carregar dados da anamnese")
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchAnamnese()
  }, [fetchAnamnese])

  const handleClinicalChange = (field: string, value: string) => {
    setClinicalData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!anamneseId) {
      toast.error("NÃ£o foi possÃ­vel identificar a anamnese deste paciente.")
      return
    }

    if (!clinicalData.mainComplaint.trim()) {
      toast.error("O Motivo da Consulta Ã© obrigatÃ³rio.")
      setActiveTab("queixa")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/pacientes/anamnese", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anamneseId, ...clinicalData }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Ficha de anamnese salva com sucesso!")
      } else {
        toast.error(json.message ?? "Erro ao salvar anamnese")
      }
    } catch {
      toast.error("Erro de conexÃ£o ao salvar anamnese")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando ficha do paciente...
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-40 bg-secondary rounded" />
              <div className="h-4 w-60 bg-secondary rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 bg-secondary/50 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const estadoCivilLabel: Record<string, string> = {
    solteiro: "Solteiro(a)",
    casado: "Casado(a)",
    divorciado: "Divorciado(a)",
    viuvo: "ViÃºvo(a)",
    "uniao-estavel": "UniÃ£o EstÃ¡vel",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ficha de Anamnese</h1>
          <p className="text-muted-foreground">
            Paciente:{" "}
            <span className="font-medium text-foreground">{personalData.nome_completo}</span>
          </p>
        </div>
        <Button onClick={() => handleSubmit()} disabled={saving || !anamneseId}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Salvando..." : "Salvar Ficha"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
            <TabsTrigger value="dados-pessoais" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>HistÃ³rico</span>
            </TabsTrigger>
            <TabsTrigger value="habitos" className="gap-2">
              <Heart className="h-4 w-4" />
              <span>HÃ¡bitos</span>
            </TabsTrigger>
            <TabsTrigger value="emocional" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Aspectos Emocionais</span>
              <span className="sm:hidden">Emocional</span>
            </TabsTrigger>
          </TabsList>

          {/* â”€â”€â”€ Dados Pessoais (somente leitura) â”€â”€â”€ */}
          <TabsContent value="dados-pessoais" className="space-y-6">
            {/* Banner informativo */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Dados do Cadastro do Paciente
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  Estas informaÃ§Ãµes vÃªm do cadastro do paciente e nÃ£o podem ser editadas aqui.
                  Para alterÃ¡-las, acesse a tela de <strong>Pacientes</strong>.
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  InformaÃ§Ãµes Pessoais
                </CardTitle>
                <CardDescription>Dados cadastrados na tela de Pacientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Nome Completo
                    </Label>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm">{personalData.nome_completo || "â€”"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Nascimento
                      </Label>
                      <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                        <span className="text-sm">
                          {personalData.data_nascimento
                            ? new Date(personalData.data_nascimento + "T12:00:00").toLocaleDateString("pt-BR")
                            : "â€”"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                        Idade
                      </Label>
                      <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                        <span className="text-sm font-medium text-primary">
                          {personalData.age ? `${personalData.age} anos` : "â€”"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">CPF</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm font-mono">{personalData.cpf || "â€”"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Telefone</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm">{personalData.telefone || "â€”"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">E-mail</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm truncate">{personalData.email || "â€”"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">ProfissÃ£o</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm">{personalData.profissao || "â€”"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">EndereÃ§o</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      <span className="text-sm">{personalData.endereco || "â€”"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Estado Civil</Label>
                    <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                      {personalData.estado_civil ? (
                        <Badge variant="outline" className="font-normal">
                          {estadoCivilLabel[personalData.estado_civil] ?? personalData.estado_civil}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">â€”</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato de EmergÃªncia
                </CardTitle>
                <CardDescription>Registrado no cadastro do paciente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Nome", value: personalData.contato_emergencia_nome },
                    { label: "Telefone", value: personalData.contato_emergencia_telefone },
                    { label: "RelaÃ§Ã£o", value: personalData.contato_emergencia_relacao },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-2">
                      <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{label}</Label>
                      <div className="flex items-center p-3 rounded-md bg-muted/50 border border-border/50">
                        <span className="text-sm">{value || "â€”"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Queixa principal â€” editÃ¡vel, fica na aba de dados pessoais para fluxo natural */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Queixa Principal
                </CardTitle>
                <CardDescription>Motivo da busca por atendimento â€” editÃ¡vel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainComplaint">
                    Motivo da Consulta <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="mainComplaint"
                    value={clinicalData.mainComplaint}
                    onChange={(e) => handleClinicalChange("mainComplaint", e.target.value)}
                    placeholder="Descreva o motivo principal da busca por atendimento"
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="problemDuration">HÃ¡ quanto tempo?</Label>
                    <Input
                      id="problemDuration"
                      value={clinicalData.problemDuration}
                      onChange={(e) => handleClinicalChange("problemDuration", e.target.value)}
                      placeholder="Ex: 6 meses, 2 anos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>JÃ¡ fez terapia antes?</Label>
                    <RadioGroup
                      value={clinicalData.previousTherapy}
                      onValueChange={(value) => handleClinicalChange("previousTherapy", value)}
                      className="flex gap-4 pt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="therapy-yes" />
                        <Label htmlFor="therapy-yes" className="font-normal">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="therapy-no" />
                        <Label htmlFor="therapy-no" className="font-normal">NÃ£o</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                {clinicalData.previousTherapy === "sim" && (
                  <div className="space-y-2">
                    <Label htmlFor="previousTherapyDetails">Detalhes da terapia anterior</Label>
                    <Textarea
                      id="previousTherapyDetails"
                      value={clinicalData.previousTherapyDetails}
                      onChange={(e) => handleClinicalChange("previousTherapyDetails", e.target.value)}
                      placeholder="Quando foi? Por quanto tempo? Qual abordagem?"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* â”€â”€â”€ HistÃ³rico â”€â”€â”€ */}
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>HistÃ³rico Pessoal</CardTitle>
                <CardDescription>InformaÃ§Ãµes mÃ©dicas e psiquiÃ¡tricas do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="physicalDiseases">DoenÃ§as FÃ­sicas</Label>
                  <Textarea
                    id="physicalDiseases"
                    value={clinicalData.physicalDiseases}
                    onChange={(e) => handleClinicalChange("physicalDiseases", e.target.value)}
                    placeholder="Liste doenÃ§as fÃ­sicas atuais ou passadas"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    value={clinicalData.medications}
                    onChange={(e) => handleClinicalChange("medications", e.target.value)}
                    placeholder="Liste medicamentos que estÃ¡ utilizando atualmente"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="psychiatricHistory">HistÃ³rico PsiquiÃ¡trico</Label>
                  <Textarea
                    id="psychiatricHistory"
                    value={clinicalData.psychiatricHistory}
                    onChange={(e) => handleClinicalChange("psychiatricHistory", e.target.value)}
                    placeholder="InternaÃ§Ãµes, diagnÃ³sticos anteriores, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HistÃ³rico Familiar</CardTitle>
                <CardDescription>InformaÃ§Ãµes sobre a famÃ­lia do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyMentalHealth">DoenÃ§as Mentais na FamÃ­lia</Label>
                  <Textarea
                    id="familyMentalHealth"
                    value={clinicalData.familyMentalHealth}
                    onChange={(e) => handleClinicalChange("familyMentalHealth", e.target.value)}
                    placeholder="Casos de depressÃ£o, ansiedade, esquizofrenia, etc. na famÃ­lia"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyRelationship">RelaÃ§Ã£o Familiar</Label>
                  <Textarea
                    id="familyRelationship"
                    value={clinicalData.familyRelationship}
                    onChange={(e) => handleClinicalChange("familyRelationship", e.target.value)}
                    placeholder="Como Ã© a relaÃ§Ã£o com pais, irmÃ£os, cÃ´njuge, filhos"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* â”€â”€â”€ HÃ¡bitos â”€â”€â”€ */}
          <TabsContent value="habitos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  HÃ¡bitos de Vida
                </CardTitle>
                <CardDescription>Rotina e estilo de vida do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sleepQuality">Qualidade do Sono</Label>
                    <Select
                      value={clinicalData.sleepQuality}
                      onValueChange={(value) => handleClinicalChange("sleepQuality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muito-ruim">Muito Ruim</SelectItem>
                        <SelectItem value="ruim">Ruim</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="bom">Bom</SelectItem>
                        <SelectItem value="muito-bom">Muito Bom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eatingHabits">AlimentaÃ§Ã£o</Label>
                    <Select
                      value={clinicalData.eatingHabits}
                      onValueChange={(value) => handleClinicalChange("eatingHabits", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muito-irregular">Muito Irregular</SelectItem>
                        <SelectItem value="irregular">Irregular</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="saudavel">SaudÃ¡vel</SelectItem>
                        <SelectItem value="muito-saudavel">Muito SaudÃ¡vel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="substanceUse">Uso de Ãlcool/Drogas</Label>
                    <Select
                      value={clinicalData.substanceUse}
                      onValueChange={(value) => handleClinicalChange("substanceUse", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum</SelectItem>
                        <SelectItem value="social">Social/Ocasional</SelectItem>
                        <SelectItem value="frequente">Frequente</SelectItem>
                        <SelectItem value="dependencia">DependÃªncia</SelectItem>
                        <SelectItem value="ex-usuario">Ex-usuÃ¡rio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physicalActivity">Atividade FÃ­sica</Label>
                    <Select
                      value={clinicalData.physicalActivity}
                      onValueChange={(value) => handleClinicalChange("physicalActivity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        <SelectItem value="raramente">Raramente</SelectItem>
                        <SelectItem value="1-2-semana">1-2x por semana</SelectItem>
                        <SelectItem value="3-4-semana">3-4x por semana</SelectItem>
                        <SelectItem value="diaria">DiÃ¡ria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* â”€â”€â”€ Aspectos Emocionais â”€â”€â”€ */}
          <TabsContent value="emocional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Aspectos Emocionais
                </CardTitle>
                <CardDescription>Estado emocional atual do paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="anxietyLevel">NÃ­vel de Ansiedade</Label>
                    <Select
                      value={clinicalData.anxietyLevel}
                      onValueChange={(value) => handleClinicalChange("anxietyLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderada">Moderada</SelectItem>
                        <SelectItem value="intensa">Intensa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stressLevel">NÃ­vel de Estresse</Label>
                    <Select
                      value={clinicalData.stressLevel}
                      onValueChange={(value) => handleClinicalChange("stressLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muito-baixo">Muito Baixo</SelectItem>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="muito-alto">Muito Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moodDescription">DescriÃ§Ã£o do Humor</Label>
                  <Textarea
                    id="moodDescription"
                    value={clinicalData.moodDescription}
                    onChange={(e) => handleClinicalChange("moodDescription", e.target.value)}
                    placeholder="Como estÃ¡ o humor do paciente? OscilaÃ§Ãµes, predominÃ¢ncia"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrentThoughts">Pensamentos Recorrentes</Label>
                  <Textarea
                    id="recurrentThoughts"
                    value={clinicalData.recurrentThoughts}
                    onChange={(e) => handleClinicalChange("recurrentThoughts", e.target.value)}
                    placeholder="Pensamentos que se repetem com frequÃªncia"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivo da Terapia
                </CardTitle>
                <CardDescription>O que o paciente espera alcanÃ§ar com o tratamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="therapyGoal">Objetivo</Label>
                  <Textarea
                    id="therapyGoal"
                    value={clinicalData.therapyGoal}
                    onChange={(e) => handleClinicalChange("therapyGoal", e.target.value)}
                    placeholder="O que o paciente deseja alcanÃ§ar com a terapia?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  ObservaÃ§Ãµes do PsicÃ³logo
                </CardTitle>
                <CardDescription>AnotaÃ§Ãµes e impressÃµes profissionais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="psychologistNotes">ObservaÃ§Ãµes</Label>
                  <Textarea
                    id="psychologistNotes"
                    value={clinicalData.psychologistNotes}
                    onChange={(e) => handleClinicalChange("psychologistNotes", e.target.value)}
                    placeholder="ImpressÃµes iniciais, pontos de atenÃ§Ã£o, plano de tratamento sugerido..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Componente raiz que decide o fluxo
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnamnesePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    searchParams.get("paciente")
  )

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id)
    // Atualiza URL sem recarregar a pÃ¡gina
    router.replace(`/dashboard/anamnese?paciente=${patient.id}`, { scroll: false })
  }

  if (!selectedPatientId) {
    return <PatientSelector onSelect={handleSelectPatient} />
  }

  return <AnamneseFormContent patientId={selectedPatientId} />
}

export function AnamnesePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando...
      </div>
    }>
      <AnamnesePageInner />
    </Suspense>
  )
}

