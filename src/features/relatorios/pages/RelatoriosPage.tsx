"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import {
  FileBarChart,
  Download,
  Calendar,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Brain,
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
  Legend,
} from "recharts"

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type FinancialItem = {
  ano: number
  mes: number
  totalReceitas: number
  totalDespesas: number
  lucroLiquido: number
}

type TransactionItem = {
  tipo: "receita" | "despesa"
  id: number
  data: string
  descricao: string
  categoriaInfo: string | null
  valor: number
  paciente: string | null
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

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const REPORT_TYPE_LABELS: Record<string, string> = {
  financeiro: "Relatório Financeiro",
  pacientes: "Relatório de Pacientes",
  agenda: "Relatório de Agenda",
  estoque: "Relatório de Estoque",
}

export function RelatoriosPage() {
  const today = new Date()
  const thisYear = today.getFullYear()

  const [dateRange, setDateRange] = useState({
    start: `${thisYear}-01-01`,
    end: `${thisYear}-12-31`,
  })
  const [appliedDates, setAppliedDates] = useState({ start: "", end: "" })
  const [reportType, setReportType] = useState("financeiro")
  const [loading, setLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Financial
  const [financialItems, setFinancialItems] = useState<FinancialItem[]>([])
  const [transactions, setTransactions] = useState<TransactionItem[]>([])

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

  // â”€â”€â”€ Data loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const loadData = useCallback(async (filterStart?: string, filterEnd?: string) => {
    setLoading(true)
    const useFilter = !!(filterStart && filterEnd)
    const qs = useFilter ? `?dataInicio=${filterStart}&dataFim=${filterEnd}` : ""

    try {
      const [finRes, pacRes, agRes, estRes] = await Promise.all([
        fetch(`/api/relatorios/financeiro${qs}`),
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

      if (finData.success) {
        setFinancialItems(finData.data.mensal)
        setTransactions(finData.data.transacoes)
      }
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

  // â”€â”€â”€ Computed: Financial â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€â”€ Computed: Patients â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const patientChartData = useMemo(
    () => patientMensais.map((item) => ({ month: item.mes, novos: item.novos })),
    [patientMensais]
  )

  const totalNovos = useMemo(
    () => patientMensais.reduce((s, r) => s + r.novos, 0),
    [patientMensais]
  )

  // â”€â”€â”€ Computed: Agenda â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const handleExport = () => {
    setIsPrinting(true)
    // Give React time to re-render with print-safe chart heights before printing
    setTimeout(() => {
      window.print()
      // After print dialog closes, restore normal view
      setTimeout(() => setIsPrinting(false), 500)
    }, 300)
  }

  const printDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const printPeriod = appliedDates.start && appliedDates.end
    ? `${new Date(appliedDates.start + "T12:00:00").toLocaleDateString("pt-BR")} a ${new Date(appliedDates.end + "T12:00:00").toLocaleDateString("pt-BR")}`
    : `01/01/${thisYear} a 31/12/${thisYear}`

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

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div className="space-y-6" ref={printRef}>

      {/* â”€â”€ Print-only professional header â”€â”€ */}
      <div className="hidden print:block">
        {/* Top brand bar - print-color-adjust forces the background to print */}
        <div style={{
          background: "#1e3a5f",
          padding: "20px 32px",
          marginBottom: 0,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Brain logo circle */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#3b82f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              } as React.CSSProperties}>
                {/* Brain icon — Lucide Brain SVG paths */}
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
              </div>
              <div>
                <div style={{ color: "#60a5fa", fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>PsiClinic</div>
                <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 3 }}>Sistema de Gestão Clínica de Psicologia</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "white", fontSize: 18, fontWeight: 600 }}>{REPORT_TYPE_LABELS[reportType]}</div>
              <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 3 }}>Gerado em {printDate}</div>
            </div>
          </div>
        </div>
        {/* Info bar */}
        <div style={{
          background: "#eff6ff",
          borderBottom: "3px solid #1e3a5f",
          padding: "10px 32px",
          display: "flex",
          gap: 32,
          fontSize: 12,
          color: "#374151",
          marginBottom: 20,
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        } as React.CSSProperties}>
          <div><span style={{ fontWeight: 700, color: "#1e3a5f" }}>Período:</span> {printPeriod}</div>
          <div><span style={{ fontWeight: 700, color: "#1e3a5f" }}>Módulo:</span> {REPORT_TYPE_LABELS[reportType]}</div>
          <div><span style={{ fontWeight: 700, color: "#1e3a5f" }}>Sistema:</span> PsiClinic v1.0</div>
        </div>
      </div>

      {/* â”€â”€ Screen-only page title & export button â”€â”€ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visualize e exporte relatórios da clínica</p>
        </div>
        <Button onClick={handleExport} disabled={isPrinting}>
          <Download className="mr-2 h-4 w-4" />
          {isPrinting ? "Preparando..." : "Exportar PDF"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="print:hidden">
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 print:hidden">
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

        {/* â”€â”€ Financial Report â”€â”€ */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 print:grid print:grid-cols-3 print:gap-4">
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
              {financialChartData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  {loading ? "Carregando..." : "Nenhum dado financeiro no período."}
                </div>
              ) : isPrinting ? (
                <BarChart data={financialChartData} width={740} height={260}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 11 }} />
                  <Bar dataKey="receitas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Receitas" isAnimationActive={false} />
                  <Bar dataKey="despesas" fill="#dc2626" radius={[4, 4, 0, 0]} name="Despesas" isAnimationActive={false} />
                </BarChart>
              ) : (
                <div className="h-87.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="receitas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Receitas" />
                      <Bar dataKey="despesas" fill="#dc2626" radius={[4, 4, 0, 0]} name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Transações</CardTitle>
              <CardDescription>Fluxo de entradas e saídas registradas no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Carregando transações...</div>
              ) : transactions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Nenhuma transação encontrada no período.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b text-muted-foreground font-medium">
                        <th className="py-2 px-3">Data</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Descrição / Serviço</th>
                        <th className="py-2 px-3">Paciente / Categoria</th>
                        <th className="py-2 px-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={`${t.tipo}-${t.id}`} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                            {new Date(t.data + "T12:00:00").toLocaleDateString("pt-BR")}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              t.tipo === 'receita'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">{t.descricao}</td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {t.tipo === 'receita' ? t.paciente || '—' : t.categoriaInfo || '—'}
                          </td>
                          <td className={`py-2.5 px-3 text-right font-semibold ${
                            t.tipo === 'receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {t.tipo === 'receita' ? '+' : '-'} {formatCurrency(t.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* â”€â”€ Patients Report â”€â”€ */}
        <TabsContent value="pacientes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 print:grid print:grid-cols-3 print:gap-4">
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
              {patientChartData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  {loading ? "Carregando..." : "Nenhum dado de pacientes encontrado."}
                </div>
              ) : isPrinting ? (
                <LineChart data={patientChartData} width={740} height={260}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 11 }} />
                  <Line type="monotone" dataKey="novos" stroke="#2563eb" strokeWidth={2} name="Novos" isAnimationActive={false} />
                </LineChart>
              ) : (
                <div className="h-87.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey="novos" stroke="#2563eb" strokeWidth={2} name="Novos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* â”€â”€ Appointments Report â”€â”€ */}
        <TabsContent value="agenda" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4 print:grid print:grid-cols-4 print:gap-4">
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
              {agendaChartData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  {loading ? "Carregando..." : "Nenhum atendimento encontrado no período."}
                </div>
              ) : isPrinting ? (
                <BarChart data={agendaChartData} width={740} height={260}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 11 }} />
                  <Bar dataKey="realizadas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Realizadas" isAnimationActive={false} />
                  <Bar dataKey="canceladas" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Canceladas" isAnimationActive={false} />
                  <Bar dataKey="faltas" fill="#dc2626" radius={[4, 4, 0, 0]} name="Faltas" isAnimationActive={false} />
                </BarChart>
              ) : (
                <div className="h-87.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agendaChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" tick={{ fill: "currentColor" }} />
                      <YAxis tick={{ fill: "currentColor" }} />
                      <Tooltip {...tooltipStyle} />
                      <Bar dataKey="realizadas" fill="#2563eb" radius={[4, 4, 0, 0]} name="Realizadas" />
                      <Bar dataKey="canceladas" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Canceladas" />
                      <Bar dataKey="faltas" fill="#dc2626" radius={[4, 4, 0, 0]} name="Faltas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* â”€â”€ Stock Report â”€â”€ */}
        <TabsContent value="estoque" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 print:grid print:grid-cols-3 print:gap-4">
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
              {estoqueCategorias.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                  {loading ? "Carregando..." : "Nenhum item de estoque encontrado."}
                </div>
              ) : isPrinting ? (
                <PieChart width={740} height={260}>
                  <Pie
                    data={estoqueCategorias}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    isAnimationActive={false}
                  >
                    {estoqueCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#2563eb","#16a34a","#7c3aed","#d97706","#dc2626","#0891b2"][index % 6]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              ) : (
                <div className="h-87.5">
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
                            fill={["#2563eb","#16a34a","#7c3aed","#d97706","#dc2626","#0891b2"][index % 6]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Suppress unused-import warnings for icon used only as JSX
void FileBarChart

