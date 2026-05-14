"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

type Patient = {
  id: string
  name: string
  phone: string
  email: string
  cpf: string
  birthDate: string
  createdAt: string
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Ana Carolina Silva",
    phone: "(11) 99999-1111",
    email: "ana.silva@email.com",
    cpf: "123.456.789-00",
    birthDate: "1990-05-15",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "João Pedro Santos",
    phone: "(11) 99999-2222",
    email: "joao.santos@email.com",
    cpf: "234.567.890-11",
    birthDate: "1985-08-22",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    name: "Maria Fernanda Lima",
    phone: "(11) 99999-3333",
    email: "maria.lima@email.com",
    cpf: "345.678.901-22",
    birthDate: "1992-03-10",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Lucas Oliveira",
    phone: "(11) 99999-4444",
    email: "lucas.oliveira@email.com",
    cpf: "456.789.012-33",
    birthDate: "1988-11-28",
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "Beatriz Costa",
    phone: "(11) 99999-5555",
    email: "beatriz.costa@email.com",
    cpf: "567.890.123-44",
    birthDate: "1995-07-03",
    createdAt: "2024-02-20",
  },
  {
    id: "6",
    name: "Rafael Mendes",
    phone: "(11) 99999-6666",
    email: "rafael.mendes@email.com",
    cpf: "678.901.234-55",
    birthDate: "1982-12-18",
    createdAt: "2024-03-01",
  },
  {
    id: "7",
    name: "Camila Rodrigues",
    phone: "(11) 99999-7777",
    email: "camila.rodrigues@email.com",
    cpf: "789.012.345-66",
    birthDate: "1993-04-25",
    createdAt: "2024-03-05",
  },
  {
    id: "8",
    name: "Felipe Almeida",
    phone: "(11) 99999-8888",
    email: "felipe.almeida@email.com",
    cpf: "890.123.456-77",
    birthDate: "1991-09-14",
    createdAt: "2024-03-10",
  },
]

const ITEMS_PER_PAGE = 5

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    birthDate: "",
  })

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf.includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingPatient) {
      setPatients(
        patients.map((p) =>
          p.id === editingPatient.id
            ? { ...p, ...formData }
            : p
        )
      )
      toast.success("Paciente atualizado com sucesso!")
    } else {
      const newPatient: Patient = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setPatients([newPatient, ...patients])
      toast.success("Paciente cadastrado com sucesso!")
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      cpf: "",
      birthDate: "",
    })
    setEditingPatient(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      cpf: patient.cpf,
      birthDate: patient.birthDate,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id))
    toast.success("Paciente excluído com sucesso!")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

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

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
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
          <DialogContent className="sm:max-w-md">
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
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Digite o nome completo"
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: formatPhone(e.target.value) })
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
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
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Telefone</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">CPF</TableHead>
                  <TableHead className="hidden md:table-cell">Idade</TableHead>
                  <TableHead className="w-17.5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
                              {getInitials(patient.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {patient.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {patient.cpf}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {calculateAge(patient.birthDate)} anos
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

          {/* Pagination */}
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
