"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
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

function AnamneseForm() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("paciente")

  const [anamneseId, setAnamneseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    age: "",
    cpf: "",
    phone: "",
    email: "",
    address: "",
    profession: "",
    civilStatus: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
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
    if (!patientId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/pacientes/anamnese?pacienteId=${patientId}`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        setAnamneseId(d.id)
        setFormData({
          name: d.nome_completo ?? "",
          birthDate: d.data_nascimento ? d.data_nascimento.split("T")[0] : "",
          age: d.data_nascimento ? calcularIdade(d.data_nascimento.split("T")[0]) : "",
          cpf: d.cpf ?? "",
          phone: d.telefone ?? "",
          email: d.email ?? "",
          address: d.endereco ?? "",
          profession: d.profissao ?? "",
          civilStatus: d.estado_civil ?? "",
          emergencyName: d.contato_emergencia_nome ?? "",
          emergencyPhone: d.contato_emergencia_telefone ?? "",
          emergencyRelation: d.contato_emergencia_relacao ?? "",
          mainComplaint: d.motivo_consulta ?? "",
          problemDuration: d.tempo_queixa ?? "",
          previousTherapy: d.fez_terapia_antes === true ? "sim" : d.fez_terapia_antes === false ? "nao" : "",
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "birthDate" && value) {
        next.age = calcularIdade(value)
      }
      return next
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!anamneseId) {
      toast.error("Selecione um paciente para salvar a anamnese")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/pacientes/anamnese", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anamneseId,
          observacoesPsicologo: formData.psychologistNotes || null,
          objetivoTerapia: formData.therapyGoal || null,
          ansiedade: formData.anxietyLevel || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Ficha de anamnese salva com sucesso!")
      } else {
        toast.error(json.message ?? "Erro ao salvar anamnese")
      }
    } catch {
      toast.error("Erro de conexão ao salvar anamnese")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ficha de Anamnese</h1>
          <p className="text-muted-foreground">
            {patientId
              ? "Preencha a ficha do paciente selecionado"
              : "Preencha as informações completas do paciente"}
          </p>
        </div>
        <Button onClick={() => handleSubmit()} disabled={saving || loading || !anamneseId}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Salvando..." : "Salvar Ficha"}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando dados do paciente...
        </div>
      )}

      {patientId && !loading && !anamneseId && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Anamnese não encontrada para este paciente. Cadastre o paciente primeiro.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="dados-pessoais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2">
            <TabsTrigger value="dados-pessoais" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="habitos" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Hábitos</span>
              <span className="sm:hidden">Hábitos</span>
            </TabsTrigger>
            <TabsTrigger value="emocional" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Aspectos Emocionais</span>
              <span className="sm:hidden">Emocional</span>
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="dados-pessoais" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>
                  Informações básicas do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Nome completo do paciente"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleChange("birthDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        value={formData.age}
                        readOnly
                        placeholder="Auto"
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profissão</Label>
                    <Input
                      id="profession"
                      value={formData.profession}
                      onChange={(e) => handleChange("profession", e.target.value)}
                      placeholder="Profissão atual"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="civilStatus">Estado Civil</Label>
                    <Select
                      value={formData.civilStatus}
                      onValueChange={(value) => handleChange("civilStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        <SelectItem value="uniao-estavel">União Estável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contato de Emergência
                </CardTitle>
                <CardDescription>
                  Pessoa para contato em caso de emergência
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Nome</Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyName}
                      onChange={(e) => handleChange("emergencyName", e.target.value)}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Telefone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation">Relação</Label>
                    <Input
                      id="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={(e) => handleChange("emergencyRelation", e.target.value)}
                      placeholder="Ex: Mãe, Cônjuge"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Queixa Principal
                </CardTitle>
                <CardDescription>
                  Motivo da busca por atendimento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainComplaint">Motivo da Consulta</Label>
                  <Textarea
                    id="mainComplaint"
                    value={formData.mainComplaint}
                    onChange={(e) => handleChange("mainComplaint", e.target.value)}
                    placeholder="Descreva o motivo principal da busca por atendimento"
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="problemDuration">Há quanto tempo?</Label>
                    <Input
                      id="problemDuration"
                      value={formData.problemDuration}
                      onChange={(e) => handleChange("problemDuration", e.target.value)}
                      placeholder="Ex: 6 meses, 2 anos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Já fez terapia antes?</Label>
                    <RadioGroup
                      value={formData.previousTherapy}
                      onValueChange={(value) => handleChange("previousTherapy", value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="therapy-yes" />
                        <Label htmlFor="therapy-yes">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="therapy-no" />
                        <Label htmlFor="therapy-no">Não</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                {formData.previousTherapy === "sim" && (
                  <div className="space-y-2">
                    <Label htmlFor="previousTherapyDetails">Detalhes da terapia anterior</Label>
                    <Textarea
                      id="previousTherapyDetails"
                      value={formData.previousTherapyDetails}
                      onChange={(e) => handleChange("previousTherapyDetails", e.target.value)}
                      placeholder="Quando foi? Por quanto tempo? Qual abordagem?"
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico */}
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Pessoal</CardTitle>
                <CardDescription>
                  Informações médicas e psiquiátricas do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="physicalDiseases">Doenças Físicas</Label>
                  <Textarea
                    id="physicalDiseases"
                    value={formData.physicalDiseases}
                    onChange={(e) => handleChange("physicalDiseases", e.target.value)}
                    placeholder="Liste doenças físicas atuais ou passadas"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Medicamentos em Uso</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleChange("medications", e.target.value)}
                    placeholder="Liste medicamentos que está utilizando atualmente"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="psychiatricHistory">Histórico Psiquiátrico</Label>
                  <Textarea
                    id="psychiatricHistory"
                    value={formData.psychiatricHistory}
                    onChange={(e) => handleChange("psychiatricHistory", e.target.value)}
                    placeholder="Internações, diagnósticos anteriores, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico Familiar</CardTitle>
                <CardDescription>
                  Informações sobre a família do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyMentalHealth">Doenças Mentais na Família</Label>
                  <Textarea
                    id="familyMentalHealth"
                    value={formData.familyMentalHealth}
                    onChange={(e) => handleChange("familyMentalHealth", e.target.value)}
                    placeholder="Casos de depressão, ansiedade, esquizofrenia, etc. na família"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyRelationship">Relação Familiar</Label>
                  <Textarea
                    id="familyRelationship"
                    value={formData.familyRelationship}
                    onChange={(e) => handleChange("familyRelationship", e.target.value)}
                    placeholder="Como é a relação com pais, irmãos, cônjuge, filhos"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hábitos */}
          <TabsContent value="habitos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Hábitos de Vida
                </CardTitle>
                <CardDescription>
                  Rotina e estilo de vida do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sleepQuality">Qualidade do Sono</Label>
                    <Select
                      value={formData.sleepQuality}
                      onValueChange={(value) => handleChange("sleepQuality", value)}
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
                    <Label htmlFor="eatingHabits">Alimentação</Label>
                    <Select
                      value={formData.eatingHabits}
                      onValueChange={(value) => handleChange("eatingHabits", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="muito-irregular">Muito Irregular</SelectItem>
                        <SelectItem value="irregular">Irregular</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="saudavel">Saudável</SelectItem>
                        <SelectItem value="muito-saudavel">Muito Saudável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="substanceUse">Uso de Álcool/Drogas</Label>
                    <Select
                      value={formData.substanceUse}
                      onValueChange={(value) => handleChange("substanceUse", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Nenhum</SelectItem>
                        <SelectItem value="social">Social/Ocasional</SelectItem>
                        <SelectItem value="frequente">Frequente</SelectItem>
                        <SelectItem value="dependencia">Dependência</SelectItem>
                        <SelectItem value="ex-usuario">Ex-usuário</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physicalActivity">Atividade Física</Label>
                    <Select
                      value={formData.physicalActivity}
                      onValueChange={(value) => handleChange("physicalActivity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhuma">Nenhuma</SelectItem>
                        <SelectItem value="raramente">Raramente</SelectItem>
                        <SelectItem value="1-2-semana">1-2x por semana</SelectItem>
                        <SelectItem value="3-4-semana">3-4x por semana</SelectItem>
                        <SelectItem value="diaria">Diária</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aspectos Emocionais */}
          <TabsContent value="emocional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Aspectos Emocionais
                </CardTitle>
                <CardDescription>
                  Estado emocional atual do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="anxietyLevel">Nível de Ansiedade</Label>
                    <Select
                      value={formData.anxietyLevel}
                      onValueChange={(value) => handleChange("anxietyLevel", value)}
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
                    <Label htmlFor="stressLevel">Nível de Estresse</Label>
                    <Select
                      value={formData.stressLevel}
                      onValueChange={(value) => handleChange("stressLevel", value)}
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
                  <Label htmlFor="moodDescription">Descrição do Humor</Label>
                  <Textarea
                    id="moodDescription"
                    value={formData.moodDescription}
                    onChange={(e) => handleChange("moodDescription", e.target.value)}
                    placeholder="Como está o humor do paciente? Oscilações, predominância"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrentThoughts">Pensamentos Recorrentes</Label>
                  <Textarea
                    id="recurrentThoughts"
                    value={formData.recurrentThoughts}
                    onChange={(e) => handleChange("recurrentThoughts", e.target.value)}
                    placeholder="Pensamentos que se repetem com frequência"
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
                <CardDescription>
                  O que o paciente espera alcançar com o tratamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="therapyGoal">Objetivo</Label>
                  <Textarea
                    id="therapyGoal"
                    value={formData.therapyGoal}
                    onChange={(e) => handleChange("therapyGoal", e.target.value)}
                    placeholder="O que o paciente deseja alcançar com a terapia?"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Observações do Psicólogo
                </CardTitle>
                <CardDescription>
                  Anotações e impressões profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="psychologistNotes">Observações</Label>
                  <Textarea
                    id="psychologistNotes"
                    value={formData.psychologistNotes}
                    onChange={(e) => handleChange("psychologistNotes", e.target.value)}
                    placeholder="Impressões iniciais, pontos de atenção, plano de tratamento sugerido..."
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

export default function AnamnesePage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <AnamneseForm />
    </Suspense>
  )
}
