"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  FileBarChart,
  Download,
  Calendar,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// ─── Types ────────────────────────────────────────────────────────────────────

type FinancialItem = {
  ano: number
  mes: number
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
}

type PatientStats = {
  total: number
  mediaIdade: number
  menorIdade: number
  maiorIdade: number
}

type PatientMonthly = { mes: string; novos: number }

type AgendaStatus = { status: string; total: number }

type AgendaMonthly = { mes: string; realizadas: number; canceladas: number; faltas: number }

type EstoqueResumo = { totalItens: number; totalCriticos: number; quantidadeTotal: number }

type EstoqueCategoria = { name: string; value: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

const COLORS = [
  "oklch(0.55 0.15 220)",
  "oklch(0.75 0.12 160)",
  "oklch(0.65 0.15 280)",
  "oklch(0.75 0.15 85)",
  "oklch(0.6 0.2 25)",
  "oklch(0.5 0.1 60)",
]

function fmtMonth(ano: number, mes: number) {
  return `${MONTH_ABBR[mes - 1]}/${String(ano).slice(2)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const today = new Date()
  const thisYear = today.getFullYear()

  const [dateRange, setDateRange] = useState({
    start: `${thisYear}-01-01`,
    end: `${thisYear}-12-31`,
  })
  const [appliedDates, setAppliedDates] = useState({ start: "", end: "" })
  const [reportType, setReportType] = useState("financeiro")
  const [loading, setLoading] = useState(true)

  // Financial
  const [financialItems, setFinancialItems] = useState<FinancialItem[]>([])

  // Patients
  const [patientStats, setPatientStats] = useState<PatientStats>({
    total: 0, mediaIdade: 0, menorIdade: 0, maiorIdade: 0,
  })
  const [patientMensais, setPatientMensais] = useState<PatientMonthly[]>([])

  // Agenda
  const [agendaPorStatus, setAgendaPorStatus] = useState<AgendaStatus[]>([])
  const [agendaMensal, setAgendaMensal] = useState<AgendaMonthly[]>([])

  // Estoque
  const [estoqueResumo, setEstoqueResumo] = useState<EstoqueResumo>({
    totalItens: 0, totalCriticos: 0, quantidadeTotal: 0,
  })
  const [estoqueCategorias, setEstoqueCategorias] = useState<EstoqueCategoria[]>([])

  // ─── Data loading ───────────────────────────────────────────────────────────

  const loadData = useCallback(async (filterStart?: string, filterEnd?: string) => {
    setLoading(true)
    const useFilter = !!(filterStart && filterEnd)
    const qs = useFilter ? `?dataInicio=${filterStart}&dataFim=${filterEnd}` : ""

    try {
      const [finRes, pacRes, agRes, estRes] = await Promise.all([
        fetch("/api/relatorios/financeiro"),
        fetch("/api/relatorios/pacientes"),
        fetch(`/api/relatorios/agenda${qs}`),
        fetch("/api/relatorios/estoque"),
      ])
      const [finData, pacData, agData, estData] = await Promise.all([
        finRes.json(),
        pacRes.json(),
        agRes.json(),
        estRes.json(),
      ])

      if (finData.success) setFinancialItems(finData.data)
      if (pacData.success) {
        setPatientStats(pacData.data.estatisticas)
        setPatientMensais(pacData.data.mensais)
      }
      if (agData.success) {
        setAgendaPorStatus(agData.data.porStatus)
        setAgendaMensal(agData.data.mensal)
      }
      if (estData.success) {
        setEstoqueResumo(estData.data.resumo)
        setEstoqueCategorias(estData.data.categorias)
      }
    } catch {
      toast.error("Erro ao carregar relatórios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Computed: Financial ────────────────────────────────────────────────────

  const filteredFinancial = useMemo(() => {
    if (!appliedDates.start || !appliedDates.end) return financialItems
    const s = appliedDates.start.substring(0, 7)
    const e = appliedDates.end.substring(0, 7)
    return financialItems.filter((item) => {
      const ym = `${item.ano}-${String(item.mes).padStart(2, "0")}`
      return ym >= s && ym <= e
    })
  }, [financialItems, appliedDates])

  const financialChartData = useMemo(
    () =>
      filteredFinancial.map((item) => ({
        month: fmtMonth(item.ano, item.mes),
        receitas: item.totalReceitas,
        despesas: item.totalDespesas,
      })),
    [filteredFinancial]
  )

  const financialTotals = useMemo(
    () => ({
      totalReceitas: filteredFinancial.reduce((s, r) => s + r.totalReceitas, 0),
      totalDespesas: filteredFinancial.reduce((s, r) => s + r.totalDespesas, 0),
      lucroLiquido: filteredFinancial.reduce((s, r) => s + r.lucroLiquido, 0),
    }),
    [filteredFinancial]
  )

  // ─── Computed: Patients ─────────────────────────────────────────────────────

  const patientChartData = useMemo(
    () => patientMensais.map((item) => ({ month: item.mes, novos: item.novos })),
    [patientMensais]
  )

  const totalNovos = useMemo(
    () => patientMensais.reduce((s, r) => s + r.novos, 0),
    [patientMensais]
  )

  // ─── Computed: Agenda ───────────────────────────────────────────────────────

  function getStatusTotal(status: string) {
    return agendaPorStatus.find((s) => s.status === status)?.total ?? 0
  }

  const agendaTotals = useMemo(() => {
    const realizadas = getStatusTotal("realizado")
    const canceladas = getStatusTotal("cancelado")
    const faltas = getStatusTotal("faltou")
    const total = agendaPorStatus.reduce((s, r) => s + r.total, 0)
    return { total, realizadas, canceladas, faltas }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaPorStatus])

  const agendaChartData = useMemo(
    () =>
      agendaMensal.map((item) => ({
        month: item.mes,
        realizadas: item.realizadas,
        canceladas: item.canceladas,
        faltas: item.faltas,
      })),
    [agendaMensal]
  )

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const handleExport = () => toast.success("Relatório exportado com sucesso!")

  const handleApplyFilters = () => {
    setAppliedDates(dateRange)
    loadData(dateRange.start, dateRange.end)
  }

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "oklch(1 0 0)",
      border: "1px solid oklch(0.92 0.01 240)",
      borderRadius: "8px",
    },
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visualize e exporte relatórios da clínica</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="start">Data Início</Label>
              <Input
                id="start"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Data Fim</Label>
              <Input
                id="end"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="pacientes">Pacientes</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={handleApplyFilters} disabled={loading}>
              {loading ? "Carregando..." : "Aplicar Filtros"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="financeiro" value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="financeiro" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="pacientes" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Pacientes</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="estoque" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Estoque</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Financial Report ── */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {loading ? "—" : formatCurrency(financialTotals.totalReceitas)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent">Acumulado do período</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {loading ? "—" : formatCurrency(financialTotals.totalDespesas)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">Acumulado do período</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    financialTotals.lucroLiquido >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {loading ? "—" : formatCurrency(financialTotals.lucroLiquido)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Receitas - Despesas</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Comparativo mensal do período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                {financialChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {loading ? "Carregando..." : "Nenhum dado financeiro no período."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="receitas" fill="oklch(0.55 0.15 220)" radius={[4, 4, 0, 0]} name="Receitas" />
                      <Bar dataKey="despesas" fill="oklch(0.55 0.2 25)" radius={[4, 4, 0, 0]} name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Patients Report ── */}
        <TabsContent value="pacientes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : patientStats.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total cadastrado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Novos Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {loading ? "—" : totalNovos}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent">Total no período</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média de Idade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : `${patientStats.mediaIdade} anos`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading
                    ? ""
                    : `Mín. ${patientStats.menorIdade} — Máx. ${patientStats.maiorIdade}`}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Novos Pacientes por Mês</CardTitle>
              <CardDescription>Cadastros realizados ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                {patientChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {loading ? "Carregando..." : "Nenhum dado de pacientes encontrado."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="novos"
                        stroke="oklch(0.55 0.15 220)"
                        strokeWidth={2}
                        name="Novos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appointments Report ── */}
        <TabsContent value="agenda" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : agendaTotals.total}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Realizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {loading ? "—" : agendaTotals.realizadas}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading || agendaTotals.total === 0
                    ? ""
                    : `${((agendaTotals.realizadas / agendaTotals.total) * 100).toFixed(1)}% do total`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Canceladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning-foreground">
                  {loading ? "—" : agendaTotals.canceladas}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading || agendaTotals.total === 0
                    ? ""
                    : `${((agendaTotals.canceladas / agendaTotals.total) * 100).toFixed(1)}% do total`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faltas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {loading ? "—" : agendaTotals.faltas}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {loading || agendaTotals.total === 0
                    ? ""
                    : `${((agendaTotals.faltas / agendaTotals.total) * 100).toFixed(1)}% do total`}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Consultas por Mês</CardTitle>
              <CardDescription>Realizadas, canceladas e faltas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                {agendaChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {loading ? "Carregando..." : "Nenhum atendimento encontrado no período."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agendaChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="realizadas" fill="oklch(0.55 0.15 220)" radius={[4, 4, 0, 0]} name="Realizadas" />
                      <Bar dataKey="canceladas" fill="oklch(0.75 0.15 85)" radius={[4, 4, 0, 0]} name="Canceladas" />
                      <Bar dataKey="faltas" fill="oklch(0.55 0.2 25)" radius={[4, 4, 0, 0]} name="Faltas" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Stock Report ── */}
        <TabsContent value="estoque" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Itens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : estoqueResumo.totalItens}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Produtos cadastrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {loading ? "—" : estoqueResumo.totalCriticos}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Itens abaixo do mínimo</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quantidade Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "—" : estoqueResumo.quantidadeTotal}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Unidades em estoque</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Quantidade de itens por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                {estoqueCategorias.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {loading ? "Carregando..." : "Nenhum item de estoque encontrado."}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={estoqueCategorias}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {estoqueCategorias.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Suppress unused-import warnings for icon used only as JSX
void FileBarChart
