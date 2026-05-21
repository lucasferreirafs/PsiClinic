"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

type Profissional = {
  id: string
  nome: string
  registro_profissional: string | null
  especialidade: string | null
}

type FormData = {
  nome: string
  registroProfissional: string
  especialidade: string
}

const EMPTY_FORM: FormData = {
  nome: "",
  registroProfissional: "",
  especialidade: "",
}

const ITEMS_PER_PAGE = 5

export function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)

  useEffect(() => {
    fetchProfissionais()
  }, [])

  const fetchProfissionais = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/profissionais")
      const json = await res.json()
      if (json.success) {
        setProfissionais(json.data)
      } else {
        setError(json.message ?? "Erro ao carregar profissionais")
      }
    } catch {
      setError("Erro de conexÃ£o ao carregar profissionais")
    } finally {
      setLoading(false)
    }
  }

  const filtered = profissionais.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.registro_profissional ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.especialidade ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const isEdit = !!editingProfissional
      const res = await fetch("/api/profissionais", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { id: editingProfissional.id, ...formData }
            : formData
        ),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(isEdit ? "Profissional atualizado com sucesso!" : "Profissional cadastrado com sucesso!")
        resetForm()
        await fetchProfissionais()
      } else {
        toast.error(json.message ?? "Erro ao salvar profissional")
      }
    } catch {
      toast.error("Erro de conexÃ£o ao salvar profissional")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (profissional: Profissional) => {
    try {
      const res = await fetch(`/api/profissionais?id=${profissional.id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Profissional inativado com sucesso!")
        await fetchProfissionais()
      } else {
        toast.error(json.message ?? "Erro ao inativar profissional")
      }
    } catch {
      toast.error("Erro de conexÃ£o ao inativar profissional")
    }
  }

  const handleEdit = (profissional: Profissional) => {
    setEditingProfissional(profissional)
    setFormData({
      nome: profissional.nome,
      registroProfissional: profissional.registro_profissional ?? "",
      especialidade: profissional.especialidade ?? "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setEditingProfissional(null)
    setIsDialogOpen(false)
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie os psicÃ³logos e profissionais da clÃ­nica
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProfissional ? "Editar Profissional" : "Novo Profissional"}
              </DialogTitle>
              <DialogDescription>
                {editingProfissional
                  ? "Atualize os dados do profissional"
                  : "Preencha os dados para cadastrar um novo profissional"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Dr(a). Nome Completo"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registro">CRP / Registro</Label>
                    <Input
                      id="registro"
                      value={formData.registroProfissional}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          registroProfissional: e.target.value,
                        })
                      }
                      placeholder="CRP 06/12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="especialidade">Especialidade</Label>
                    <Input
                      id="especialidade"
                      value={formData.especialidade}
                      onChange={(e) =>
                        setFormData({ ...formData, especialidade: e.target.value })
                      }
                      placeholder="Psicologia ClÃ­nica"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProfissional ? "Salvar AlteraÃ§Ãµes" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Lista de Profissionais
          </CardTitle>
          <CardDescription>
            Total de {profissionais.length} profissional(is) ativo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CRP ou especialidade..."
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
                onClick={fetchProfissionais}
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
                  <TableHead>Profissional</TableHead>
                  <TableHead className="hidden sm:table-cell">CRP / Registro</TableHead>
                  <TableHead className="hidden md:table-cell">Especialidade</TableHead>
                  <TableHead className="w-[70px]">AÃ§Ãµes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando profissionais...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {searchTerm
                        ? "Nenhum profissional encontrado para esta busca."
                        : "Nenhum profissional cadastrado. Clique em \"Novo Profissional\" para comeÃ§ar."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(prof.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{prof.nome}</p>
                            {prof.especialidade && (
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {prof.especialidade}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {prof.registro_profissional ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {prof.registro_profissional}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">â€”</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {prof.especialidade ?? "â€”"}
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
                            <DropdownMenuItem onClick={() => handleEdit(prof)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(prof)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Inativar
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
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de{" "}
                {filtered.length} resultado(s)
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

