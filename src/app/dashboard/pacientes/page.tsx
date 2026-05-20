"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

type Patient = {
  id: string
  nome_completo: string
  email: string
  telefone: string
  idade: number
}

type FormData = {
  nomeCompleto: string
  dataNascimento: string
  cpf: string
  telefone: string
  email: string
  endereco: string
  profissao: string
  estadoCivil: string
  contatoEmergenciaNome: string
  contatoEmergenciaTelefone: string
  contatoEmergenciaRelacao: string
  motivoConsulta: string
  tempoQueixa: string
}

const EMPTY_FORM: FormData = {
  nomeCompleto: "",
  dataNascimento: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
  profissao: "",
  estadoCivil: "",
  contatoEmergenciaNome: "",
  contatoEmergenciaTelefone: "",
  contatoEmergenciaRelacao: "",
  motivoConsulta: "",
  tempoQueixa: "",
}

const ITEMS_PER_PAGE = 5

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/pacientes")
      const json = await res.json()
      if (json.success) {
        setPatients(json.data)
      } else {
        setError(json.message ?? "Erro ao carregar pacientes")
      }
    } catch {
      setError("Erro de conexão ao carregar pacientes")
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPatient) {
      setSubmitting(true)
      try {
        const res = await fetch("/api/pacientes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPatient.id,
            ...formData,
          }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success("Paciente atualizado com sucesso!")
          resetForm()
          await fetchPatients()
        } else {
          toast.error(json.message ?? "Erro ao atualizar paciente")
        }
      } catch {
        toast.error("Erro de conexão ao atualizar paciente")
      } finally {
        setSubmitting(false)
      }
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Paciente cadastrado com sucesso!")
        resetForm()
        await fetchPatients()
      } else {
        toast.error(json.message ?? "Erro ao cadastrar paciente")
      }
    } catch {
      toast.error("Erro de conexão ao cadastrar paciente")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingPatient(null)
    setIsDialogOpen(false)
  }

  const handleEdit = async (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      ...EMPTY_FORM,
      nomeCompleto: patient.nome_completo,
      telefone: formatPhone(patient.telefone),
      email: patient.email,
    })
    setIsDialogOpen(true)

    try {
      const res = await fetch(`/api/pacientes?id=${patient.id}`)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        setFormData({
          nomeCompleto: d.nome_completo ?? "",
          dataNascimento: d.data_nascimento ? d.data_nascimento.split("T")[0] : "",
          cpf: d.cpf ? formatCPF(d.cpf) : "",
          telefone: d.telefone ? formatPhone(d.telefone) : "",
          email: d.email ?? "",
          endereco: d.endereco ?? "",
          profissao: d.profissao ?? "",
          estadoCivil: d.estado_civil ?? "",
          contatoEmergenciaNome: d.contato_emergencia_nome ?? "",
          contatoEmergenciaTelefone: d.contato_emergencia_telefone ? formatPhone(d.contato_emergencia_telefone) : "",
          contatoEmergenciaRelacao: d.contato_emergencia_relacao ?? "",
          motivoConsulta: "",
          tempoQueixa: "",
        })
      }
    } catch {
      toast.error("Erro ao carregar detalhes completos do paciente.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/pacientes?id=${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (json.success) {
        setPatients(patients.filter((p) => p.id !== id))
        toast.success("Paciente excluído com sucesso!")
      } else {
        toast.error(json.message ?? "Erro ao excluir paciente")
      }
    } catch {
      toast.error("Erro de conexão ao excluir paciente")
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    return value
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }
    return value
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes da clínica
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Editar Paciente" : "Novo Paciente"}
              </DialogTitle>
              <DialogDescription>
                {editingPatient
                  ? "Atualize as informações do paciente"
                  : "Preencha os dados para cadastrar um novo paciente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 py-4">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Dados Pessoais
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="nomeCompleto">Nome Completo</Label>
                    <Input
                      id="nomeCompleto"
                      value={formData.nomeCompleto}
                      onChange={(e) =>
                        setFormData({ ...formData, nomeCompleto: e.target.value })
                      }
                      placeholder="Nome completo do paciente"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) =>
                          setFormData({ ...formData, cpf: formatCPF(e.target.value) })
                        }
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required={!editingPatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) =>
                          setFormData({ ...formData, dataNascimento: e.target.value })
                        }
                        required={!editingPatient}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({ ...formData, telefone: formatPhone(e.target.value) })
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      placeholder="Endereço completo"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input
                        id="profissao"
                        value={formData.profissao}
                        onChange={(e) =>
                          setFormData({ ...formData, profissao: e.target.value })
                        }
                        placeholder="Profissão atual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estadoCivil">Estado Civil</Label>
                      <Select
                        value={formData.estadoCivil}
                        onValueChange={(value) =>
                          setFormData({ ...formData, estadoCivil: value })
                        }
                      >
                        <SelectTrigger id="estadoCivil">
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
                </div>

                {/* Contato de Emergência — visível tanto no cadastro quanto na edição */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Contato de Emergência
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contatoEmergenciaNome">Nome</Label>
                      <Input
                        id="contatoEmergenciaNome"
                        value={formData.contatoEmergenciaNome}
                        onChange={(e) =>
                          setFormData({ ...formData, contatoEmergenciaNome: e.target.value })
                        }
                        placeholder="Nome do contato"
                        required={!editingPatient}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contatoEmergenciaTelefone">Telefone</Label>
                      <Input
                        id="contatoEmergenciaTelefone"
                        value={formData.contatoEmergenciaTelefone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contatoEmergenciaTelefone: formatPhone(e.target.value),
                          })
                        }
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        required={!editingPatient}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contatoEmergenciaRelacao">Relação</Label>
                    <Input
                      id="contatoEmergenciaRelacao"
                      value={formData.contatoEmergenciaRelacao}
                      onChange={(e) =>
                        setFormData({ ...formData, contatoEmergenciaRelacao: e.target.value })
                      }
                      placeholder="Ex: Mãe, Cônjuge, Irmão"
                      required={!editingPatient}
                    />
                  </div>
                </div>

                {/* Queixa Principal */}
                {!editingPatient && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Queixa Principal
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="motivoConsulta">Motivo da Consulta</Label>
                      <Textarea
                        id="motivoConsulta"
                        value={formData.motivoConsulta}
                        onChange={(e) =>
                          setFormData({ ...formData, motivoConsulta: e.target.value })
                        }
                        placeholder="Descreva o motivo da busca por atendimento"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempoQueixa">Há quanto tempo?</Label>
                      <Input
                        id="tempoQueixa"
                        value={formData.tempoQueixa}
                        onChange={(e) =>
                          setFormData({ ...formData, tempoQueixa: e.target.value })
                        }
                        placeholder="Ex: 6 meses, 2 anos"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPatient ? "Salvar Alterações" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            Total de {patients.length} paciente(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}{" "}
              <button
                onClick={fetchPatients}
                className="underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Idade</TableHead>
                  <TableHead className="w-17.5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando pacientes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum paciente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(patient.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.nome_completo}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {patient.telefone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {patient.telefone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {patient.idade} anos
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/pacientes/${patient.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/anamnese?paciente=${patient.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Ficha de Anamnese
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(patient)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(patient.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} de{" "}
                {filteredPatients.length} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
