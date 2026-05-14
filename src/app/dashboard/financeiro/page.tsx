"use client"

import { useState, useMemo } from "react"
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

const mockRevenues: Revenue[] = [
  { id: "1", date: "2024-06-01", patient: "Ana Carolina Silva", service: "Consulta Individual", paymentMethod: "PIX", amount: 200, status: "pago" },
  { id: "2", date: "2024-06-02", patient: "João Pedro Santos", service: "Consulta Individual", paymentMethod: "Cartão", amount: 200, status: "pago" },
  { id: "3", date: "2024-06-03", patient: "Maria Fernanda Lima", service: "Terapia de Casal", paymentMethod: "PIX", amount: 350, status: "pago" },
  { id: "4", date: "2024-06-05", patient: "Lucas Oliveira", service: "Consulta Individual", paymentMethod: "Dinheiro", amount: 200, status: "pendente" },
  { id: "5", date: "2024-06-07", patient: "Beatriz Costa", service: "Avaliação Psicológica", paymentMethod: "PIX", amount: 500, status: "pago" },
  { id: "6", date: "2024-06-10", patient: "Rafael Mendes", service: "Consulta Individual", paymentMethod: "Cartão", amount: 200, status: "pago" },
  { id: "7", date: "2024-06-12", patient: "Camila Rodrigues", service: "Consulta Individual", paymentMethod: "PIX", amount: 200, status: "cancelado" },
]

const mockExpenses: Expense[] = [
  { id: "1", date: "2024-06-01", description: "Aluguel", category: "Infraestrutura", amount: 2500 },
  { id: "2", date: "2024-06-01", description: "Internet e Telefone", category: "Infraestrutura", amount: 250 },
  { id: "3", date: "2024-06-05", description: "Material de Escritório", category: "Materiais", amount: 150 },
  { id: "4", date: "2024-06-10", description: "Café e Água", category: "Suprimentos", amount: 180 },
  { id: "5", date: "2024-06-15", description: "Limpeza", category: "Serviços", amount: 400 },
  { id: "6", date: "2024-06-20", description: "Software de Gestão", category: "Tecnologia", amount: 99 },
]

const monthlyData = [
  { month: "Jan", receitas: 12500, despesas: 4200 },
  { month: "Fev", receitas: 14200, despesas: 4800 },
  { month: "Mar", receitas: 15800, despesas: 5100 },
  { month: "Abr", receitas: 13900, despesas: 4500 },
  { month: "Mai", receitas: 16500, despesas: 5200 },
  { month: "Jun", receitas: 18200, despesas: 5500 },
]

const expenseCategories = [
  { name: "Infraestrutura", value: 2750, color: "oklch(0.55 0.15 220)" },
  { name: "Materiais", value: 150, color: "oklch(0.75 0.12 160)" },
  { name: "Suprimentos", value: 180, color: "oklch(0.65 0.15 280)" },
  { name: "Serviços", value: 400, color: "oklch(0.75 0.15 85)" },
  { name: "Tecnologia", value: 99, color: "oklch(0.6 0.2 25)" },
]

const patients = [
  "Ana Carolina Silva",
  "João Pedro Santos",
  "Maria Fernanda Lima",
  "Lucas Oliveira",
  "Beatriz Costa",
  "Rafael Mendes",
  "Camila Rodrigues",
]

const services = [
  "Consulta Individual",
  "Terapia de Casal",
  "Terapia Familiar",
  "Avaliação Psicológica",
  "Acompanhamento Online",
]

const paymentMethods = ["PIX", "Cartão", "Dinheiro", "Boleto"]

const expenseCategoriesList = ["Infraestrutura", "Materiais", "Suprimentos", "Serviços", "Tecnologia", "Outros"]

export default function FinanceiroPage() {
  const [revenues, setRevenues] = useState<Revenue[]>(mockRevenues)
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [searchTerm, setSearchTerm] = useState("")
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

  const totals = useMemo(() => {
    const totalReceitas = revenues
      .filter((r) => r.status === "pago")
      .reduce((sum, r) => sum + r.amount, 0)
    const totalDespesas = expenses.reduce((sum, e) => sum + e.amount, 0)
    const lucroLiquido = totalReceitas - totalDespesas
    return { totalReceitas, totalDespesas, lucroLiquido }
  }, [revenues, expenses])

  const filteredRevenues = revenues.filter(
    (r) =>
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault()
    const newRevenue: Revenue = {
      id: String(Date.now()),
      date: revenueForm.date,
      patient: revenueForm.patient,
      service: revenueForm.service,
      paymentMethod: revenueForm.paymentMethod,
      amount: Number(revenueForm.amount),
      status: revenueForm.status,
    }
    setRevenues([newRevenue, ...revenues])
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
  }

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const newExpense: Expense = {
      id: String(Date.now()),
      date: expenseForm.date,
      description: expenseForm.description,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
    }
    setExpenses([newExpense, ...expenses])
    toast.success("Despesa adicionada com sucesso!")
    setExpenseForm({
      date: "",
      description: "",
      category: "",
      amount: "",
    })
    setIsExpenseDialogOpen(false)
  }

  const handleDeleteRevenue = (id: string) => {
    setRevenues(revenues.filter((r) => r.id !== id))
    toast.success("Receita excluída!")
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id))
    toast.success("Despesa excluída!")
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
              {formatCurrency(totals.totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-accent" />
              <span className="text-accent">+10.3%</span> vs mês anterior
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
              {formatCurrency(totals.totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-destructive">+5.8%</span> vs mês anterior
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
            <div className={`text-2xl font-bold ${totals.lucroLiquido >= 0 ? "text-accent" : "text-destructive"}`}>
              {formatCurrency(totals.lucroLiquido)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Receitas e despesas dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-62.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
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
                  <XAxis dataKey="month" tick={{ fill: 'currentColor' }} className="text-xs" />
                  <YAxis tick={{ fill: 'currentColor' }} className="text-xs" />
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
            <CardDescription>Distribuição das despesas do mês</CardDescription>
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
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
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
          <TabsTrigger value="receitas" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="gap-2">
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
                  <CardDescription>
                    {revenues.length} registro(s) de receita
                  </CardDescription>
                </div>
                <Dialog open={isRevenueDialogOpen} onOpenChange={setIsRevenueDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
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
                              onChange={(e) => setRevenueForm({ ...revenueForm, date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              type="number"
                              value={revenueForm.amount}
                              onChange={(e) => setRevenueForm({ ...revenueForm, amount: e.target.value })}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Paciente</Label>
                          <Select
                            value={revenueForm.patient}
                            onValueChange={(value) => setRevenueForm({ ...revenueForm, patient: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Serviço</Label>
                          <Select
                            value={revenueForm.service}
                            onValueChange={(value) => setRevenueForm({ ...revenueForm, service: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Forma de Pagamento</Label>
                            <Select
                              value={revenueForm.paymentMethod}
                              onValueChange={(value) => setRevenueForm({ ...revenueForm, paymentMethod: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {paymentMethods.map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={revenueForm.status}
                              onValueChange={(value: Revenue["status"]) => setRevenueForm({ ...revenueForm, status: value })}
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
                        <Button type="button" variant="outline" onClick={() => setIsRevenueDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Adicionar</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
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
                    {filteredRevenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma receita encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRevenues.map((revenue) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Despesas</CardTitle>
                  <CardDescription>
                    {expenses.length} registro(s) de despesa
                  </CardDescription>
                </div>
                <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
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
                              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              type="number"
                              value={expenseForm.amount}
                              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                              placeholder="0.00"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Input
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                            placeholder="Descrição da despesa"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select
                            value={expenseForm.category}
                            onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategoriesList.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Adicionar</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
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
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma despesa encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
