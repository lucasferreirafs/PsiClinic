"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type Revenue = {
  id: string
  date: string
  patient: string
  service: string
  paymentMethod: string
  amount: number
  status: "pendente" | "pago" | "cancelado"
}

type Expense = {
  id: string
  date: string
  description: string
  category: string
  amount: number
}

type Patient = {
  id: string
  nome_completo: string
}

type ChartData = {
  month: string
  receitas: number
  despesas: number
}

type SummaryCards = {
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
}

const ITEMS_PER_PAGE = 10

const CATEGORY_COLORS: Record<string, string> = {
  Infraestrutura: "oklch(0.55 0.15 220)",
  Materiais: "oklch(0.75 0.12 160)",
  Suprimentos: "oklch(0.65 0.15 280)",
  Serviços: "oklch(0.75 0.15 85)",
  Tecnologia: "oklch(0.6 0.2 25)",
  Outros: "oklch(0.5 0.1 60)",
}

const COLOR_PALETTE = Object.values(CATEGORY_COLORS)

const services = [
  "Consulta Individual",
  "Terapia de Casal",
  "Terapia Familiar",
  "Avaliação Psicológica",
  "Acompanhamento Online",
]

const paymentMethods = ["PIX", "Cartão", "Dinheiro", "Boleto"]

const expenseCategoriesList = [
  "Infraestrutura",
  "Materiais",
  "Suprimentos",
  "Serviços",
  "Tecnologia",
  "Outros",
]

export function FinanceiroPage() {
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [summaryCards, setSummaryCards] = useState<SummaryCards>({
    totalReceitas: 0,
    totalDespesas: 0,
    lucroLiquido: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPageRevenues, setCurrentPageRevenues] = useState(1)
  const [currentPageExpenses, setCurrentPageExpenses] = useState(1)
  const [isRevenueDialogOpen, setIsRevenueDialogOpen] = useState(false)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [revenueForm, setRevenueForm] = useState({
    date: "",
    patient: "",
    service: "",
    paymentMethod: "",
    amount: "",
    status: "pendente" as Revenue["status"],
  })
  const [expenseForm, setExpenseForm] = useState({
    date: "",
    description: "",
    category: "",
    amount: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [revenuesRes, expensesRes, resumoRes, patientsRes] = await Promise.all([
        fetch("/api/financeiro/receita"),
        fetch("/api/financeiro/despesa"),
        fetch("/api/financeiro/resumo"),
        fetch("/api/pacientes"),
      ])

      const [revenuesData, expensesData, resumoData, patientsData] = await Promise.all([
        revenuesRes.json(),
        expensesRes.json(),
        resumoRes.json(),
        patientsRes.json(),
      ])

      if (revenuesData.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRevenues(revenuesData.data.map((r: any) => ({
          id: r.id,
          date: r.data_receita,
          patient: r.paciente || "—",
          service: r.servico,
          paymentMethod: r.forma_pagamento || "—",
          amount: Number(r.valor),
          status: r.status as Revenue["status"],
        })))
      }

      if (expensesData.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setExpenses(expensesData.data.map((e: any) => ({
          id: e.id,
          date: e.data_despesa,
          description: e.descricao,
          category: e.categoria || "Outros",
          amount: Number(e.valor),
        })))
      }

      if (resumoData.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows: any[] = resumoData.data

        setChartData(rows.map((r) => ({
          month: `${String(r.mes).padStart(2, "0")}/${r.ano}`,
          receitas: Number(r.total_receitas),
          despesas: Number(r.total_despesas),
        })))

        const totalReceitas = rows.reduce((sum, r) => sum + Number(r.total_receitas), 0)
        const totalDespesas = rows.reduce((sum, r) => sum + Number(r.total_despesas), 0)
        const lucroLiquido = rows.reduce((sum, r) => sum + Number(r.lucro_liquido), 0)
        setSummaryCards({ totalReceitas, totalDespesas, lucroLiquido })
      }

      if (patientsData.success) {
        setPatients(patientsData.data)
      }
    } catch {
      toast.error("Erro ao carregar dados financeiros")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredRevenues = revenues.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPagesRevenues = Math.ceil(filteredRevenues.length / ITEMS_PER_PAGE)
  const paginatedRevenues = filteredRevenues.slice(
    (currentPageRevenues - 1) * ITEMS_PER_PAGE,
    currentPageRevenues * ITEMS_PER_PAGE
  )

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPagesExpenses = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE)
  const paginatedExpenses = filteredExpenses.slice(
    (currentPageExpenses - 1) * ITEMS_PER_PAGE,
    currentPageExpenses * ITEMS_PER_PAGE
  )

  const expenseCategories = useMemo(() => {
    const grouped: Record<string, number> = {}
    expenses.forEach((e) => {
      const cat = e.category || "Outros"
      grouped[cat] = (grouped[cat] || 0) + e.amount
    })
    return Object.entries(grouped).map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] ?? COLOR_PALETTE[i % COLOR_PALETTE.length],
    }))
  }, [expenses])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const handleAddRevenue = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submitting) return

    if (!revenueForm.patient) {
      toast.error("Selecione um paciente")
      return
    }
    if (!revenueForm.service) {
      toast.error("Selecione um serviço")
      return
    }
    if (!revenueForm.amount || Number(revenueForm.amount) < 0) {
      toast.error("Informe um valor válido")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/financeiro/receita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId: revenueForm.patient,
          servico: revenueForm.service,
          formaPagamento: revenueForm.paymentMethod || null,
          valor: Number(revenueForm.amount),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.message || "Erro ao registrar receita")
        setSubmitting(false)
        return
      }

      if (revenueForm.status !== "pendente" && data.id) {
        await fetch("/api/financeiro/receita/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receitaId: data.id, status: revenueForm.status }),
        })
      }

      toast.success("Receita adicionada com sucesso!")
      setRevenueForm({
        date: "",
        patient: "",
        service: "",
        paymentMethod: "",
        amount: "",
        status: "pendente",
      })
      setIsRevenueDialogOpen(false)
      await loadData()
    } catch {
      toast.error("Erro ao registrar receita")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (submitting) return

    if (!expenseForm.description.trim()) {
      toast.error("Informe a descrição da despesa")
      return
    }
    if (!expenseForm.amount || Number(expenseForm.amount) < 0) {
      toast.error("Informe um valor válido")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/financeiro/despesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: expenseForm.description,
          categoria: expenseForm.category || null,
          valor: Number(expenseForm.amount),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.message || "Erro ao registrar despesa")
        setSubmitting(false)
        return
      }

      toast.success("Despesa adicionada com sucesso!")
      setExpenseForm({ date: "", description: "", category: "", amount: "" })
      setIsExpenseDialogOpen(false)
      await loadData()
    } catch {
      toast.error("Erro ao registrar despesa")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRevenue = async (id: string) => {
    try {
      const res = await fetch(`/api/financeiro/receita?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setRevenues(revenues.filter((r) => r.id !== id))
        toast.success("Receita excluída com sucesso!")
        await loadData()
      } else {
        toast.error(data.message || "Erro ao excluir receita")
      }
    } catch {
      toast.error("Erro de conexão ao excluir receita")
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/financeiro/despesa?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setExpenses(expenses.filter((e) => e.id !== id))
        toast.success("Despesa excluída com sucesso!")
        await loadData()
      } else {
        toast.error(data.message || "Erro ao excluir despesa")
      }
    } catch {
      toast.error("Erro de conexão ao excluir despesa")
    }
  }

  const getStatusBadge = (status: Revenue["status"]) => {
    const styles = {
      pendente: "bg-warning/10 text-warning-foreground border-warning/20",
      pago: "bg-accent/10 text-accent-foreground border-accent/20",
      cancelado: "bg-destructive/10 text-destructive border-destructive/20",
    }
    const labels = {
      pendente: "Pendente",
      pago: "Pago",
      cancelado: "Cancelado",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Controle de receitas e despesas da clínica
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Receitas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {loading ? "—" : formatCurrency(summaryCards.totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-accent" />
              <span className="text-accent">Acumulado geral</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? "—" : formatCurrency(summaryCards.totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-destructive">Acumulado geral</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                summaryCards.lucroLiquido >= 0 ? "text-accent" : "text-destructive"
              }`}
            >
              {loading ? "—" : formatCurrency(summaryCards.lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Receitas - Despesas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Receitas e despesas por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 220)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 220)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.2 25)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.2 25)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: "currentColor" }} className="text-xs" />
                  <YAxis tick={{ fill: "currentColor" }} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.92 0.01 240)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="oklch(0.55 0.15 220)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="oklch(0.55 0.2 25)"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {expenseCategories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-muted-foreground">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="receitas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receitas" className="gap-2 cursor-pointer">
            <TrendingUp className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="gap-2 cursor-pointer">
            <TrendingDown className="h-4 w-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Receitas</CardTitle>
                  <CardDescription>{revenues.length} registro(s) de receita</CardDescription>
                </div>
                <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Receita
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Receita</DialogTitle>
                      <DialogDescription>
                        Registre uma nova entrada financeira
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRevenue}>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <Input
                              type="date"
                              value={revenueForm.date}
                              onChange={(e) =>
                                setRevenueForm({ ...revenueForm, date: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              type="number"
                              value={revenueForm.amount}
                              onChange={(e) =>
                                setRevenueForm({ ...revenueForm, amount: e.target.value })
                              }
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Paciente</Label>
                          <Select
                            value={revenueForm.patient}
                            onValueChange={(value) =>
                              setRevenueForm({ ...revenueForm, patient: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.nome_completo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Serviço</Label>
                          <Select
                            value={revenueForm.service}
                            onValueChange={(value) =>
                              setRevenueForm({ ...revenueForm, service: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select
                              value={revenueForm.paymentMethod}
                              onValueChange={(value) =>
                                setRevenueForm({ ...revenueForm, paymentMethod: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={revenueForm.status}
                              onValueChange={(value: Revenue["status"]) =>
                                setRevenueForm({ ...revenueForm, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendente">Pendente</SelectItem>
                                <SelectItem value="pago">Pago</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsRevenueDialogOpen(false)}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {/* Tabela de Receitas */}
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead className="hidden md:table-cell">Serviço</TableHead>
                      <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center border ">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando receitar...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedRevenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma receita encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRevenues.map((revenue) => (
                        <TableRow key={revenue.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(revenue.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium">{revenue.patient}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {revenue.service}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {revenue.paymentMethod}
                          </TableCell>
                          <TableCell className="font-medium text-accent">
                            {formatCurrency(revenue.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(revenue.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRevenue(revenue.id)}
                                  className="text-destructive"
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
              {totalPagesRevenues > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPageRevenues - 1) * ITEMS_PER_PAGE + 1} a{" "}
                    {Math.min(currentPageRevenues * ITEMS_PER_PAGE, filteredRevenues.length)} de{" "}
                    {filteredRevenues.length} resultados
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPageRevenues((p) => Math.max(1, p - 1))}
                      disabled={currentPageRevenues === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPageRevenues} de {totalPagesRevenues}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPageRevenues((p) => Math.min(totalPagesRevenues, p + 1))}
                      disabled={currentPageRevenues === totalPagesRevenues}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent> 
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Despesas</CardTitle>
                  <CardDescription>{expenses.length} registro(s) de despesa</CardDescription>
                </div>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Despesa
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Despesa</DialogTitle>
                      <DialogDescription>
                        Registre uma nova saída financeira
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddExpense}>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <Input
                              type="date"
                              value={expenseForm.date}
                              onChange={(e) =>
                                setExpenseForm({ ...expenseForm, date: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              type="number"
                              value={expenseForm.amount}
                              onChange={(e) =>
                                setExpenseForm({ ...expenseForm, amount: e.target.value })
                              }
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={expenseForm.description}
                            onChange={(e) =>
                              setExpenseForm({ ...expenseForm, description: e.target.value })
                            }
                            placeholder="Descrição da despesa"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select
                            value={expenseForm.category}
                            onValueChange={(value) =>
                              setExpenseForm({ ...expenseForm, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategoriesList.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsExpenseDialogOpen(false)}
                          disabled={submitting}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {/* Tabela de Despesas */}
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Carregando despesas...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma despesa encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium">{expense.description}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="secondary">{expense.category}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-destructive">
                            -{formatCurrency(expense.amount)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-destructive"
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
              {totalPagesExpenses > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPageExpenses - 1) * ITEMS_PER_PAGE + 1} a{" "}
                    {Math.min(currentPageExpenses * ITEMS_PER_PAGE, filteredExpenses.length)} de{" "}
                    {filteredExpenses.length} resultados
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPageExpenses((p) => Math.max(1, p - 1))}
                      disabled={currentPageExpenses === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {currentPageExpenses} de {totalPagesExpenses}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPageExpenses((p) => Math.min(totalPagesExpenses, p + 1))}
                      disabled={currentPageExpenses === totalPagesExpenses}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

