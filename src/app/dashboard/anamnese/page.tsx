"use client"

import { useState, Suspense } from "react"
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

function AnamneseForm() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("paciente")

  const [formData, setFormData] = useState({
    // Dados pessoais
    name: "",
    birthDate: "",
    age: "",
    cpf: "",
    phone: "",
    email: "",
    address: "",
    profession: "",
    civilStatus: "",
    // Contato emergência
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    // Queixa principal
    mainComplaint: "",
    problemDuration: "",
    previousTherapy: "",
    previousTherapyDetails: "",
    // Histórico pessoal
    physicalDiseases: "",
    medications: "",
    psychiatricHistory: "",
    // Histórico familiar
    familyMentalHealth: "",
    familyRelationship: "",
    // Hábitos
    sleepQuality: "",
    eatingHabits: "",
    substanceUse: "",
    physicalActivity: "",
    // Aspectos emocionais
    anxietyLevel: "",
    moodDescription: "",
    stressLevel: "",
    recurrentThoughts: "",
    // Objetivo
    therapyGoal: "",
    // Observações
    psychologistNotes: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-calculate age when birth date changes
    if (field === "birthDate" && value) {
      const today = new Date()
      const birth = new Date(value)
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      setFormData((prev) => ({ ...prev, age: String(age) }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Ficha de anamnese salva com sucesso!")
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
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Ficha
        </Button>
      </div>

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
                        <SelectItem value="muito-baixo">Muito Baixo</SelectItem>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="muito-alto">Muito Alto</SelectItem>
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
