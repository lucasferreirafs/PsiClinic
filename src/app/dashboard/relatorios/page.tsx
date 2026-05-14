"use client"

import { useState } from "react"
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

const financialData = [
  { month: "Jan", receitas: 12500, despesas: 4200 },
  { month: "Fev", receitas: 14200, despesas: 4800 },
  { month: "Mar", receitas: 15800, despesas: 5100 },
  { month: "Abr", receitas: 13900, despesas: 4500 },
  { month: "Mai", receitas: 16500, despesas: 5200 },
  { month: "Jun", receitas: 18200, despesas: 5500 },
]

const patientsData = [
  { month: "Jan", novos: 12, ativos: 180 },
  { month: "Fev", novos: 15, ativos: 188 },
  { month: "Mar", novos: 18, ativos: 200 },
  { month: "Abr", novos: 10, ativos: 205 },
  { month: "Mai", novos: 20, ativos: 220 },
  { month: "Jun", novos: 22, ativos: 238 },
]

const appointmentsData = [
  { month: "Jan", realizadas: 120, canceladas: 8, faltas: 12 },
  { month: "Fev", realizadas: 135, canceladas: 10, faltas: 15 },
  { month: "Mar", realizadas: 142, canceladas: 12, faltas: 18 },
  { month: "Abr", realizadas: 128, canceladas: 6, faltas: 10 },
  { month: "Mai", realizadas: 155, canceladas: 14, faltas: 16 },
  { month: "Jun", realizadas: 168, canceladas: 8, faltas: 12 },
]

const stockCategories = [
  { name: "Descartáveis", value: 35 },
  { name: "Bebidas", value: 25 },
  { name: "Escritório", value: 20 },
  { name: "Higiene", value: 12 },
  { name: "Outros", value: 8 },
]

const COLORS = [
  "oklch(0.55 0.15 220)",
  "oklch(0.75 0.12 160)",
  "oklch(0.65 0.15 280)",
  "oklch(0.75 0.15 85)",
  "oklch(0.6 0.2 25)",
]

export default function RelatoriosPage() {
  const [dateRange, setDateRange] = useState({
    start: "2024-01-01",
    end: "2024-06-30",
  })
  const [reportType, setReportType] = useState("financeiro")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleExport = () => {
    toast.success("Relatório exportado com sucesso!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios da clínica
          </p>
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
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Data Fim</Label>
              <Input
                id="end"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
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
            <Button variant="secondary">Aplicar Filtros</Button>
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

        {/* Financial Report */}
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
                  {formatCurrency(91100)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent">+15.2%</span> vs período anterior
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
                  {formatCurrency(29300)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">+8.5%</span> vs período anterior
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
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(61800)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  67.8% de margem
                </p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'currentColor' }} />
                    <YAxis tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 240)",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="receitas"
                      fill="oklch(0.55 0.15 220)"
                      radius={[4, 4, 0, 0]}
                      name="Receitas"
                    />
                    <Bar
                      dataKey="despesas"
                      fill="oklch(0.55 0.2 25)"
                      radius={[4, 4, 0, 0]}
                      name="Despesas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Report */}
        <TabsContent value="pacientes" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pacientes Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">238</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No período selecionado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Novos Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">97</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-accent">+22%</span> vs período anterior
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Taxa de Retenção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pacientes que retornaram
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução de Pacientes</CardTitle>
              <CardDescription>Novos pacientes e base ativa por mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'currentColor' }} />
                    <YAxis yAxisId="left" tick={{ fill: 'currentColor' }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 240)",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="novos"
                      stroke="oklch(0.75 0.12 160)"
                      strokeWidth={2}
                      name="Novos"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ativos"
                      stroke="oklch(0.55 0.15 220)"
                      strokeWidth={2}
                      name="Ativos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Report */}
        <TabsContent value="agenda" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">848</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Realizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">848</div>
                <p className="text-xs text-muted-foreground mt-1">91.2% do total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Canceladas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning-foreground">58</div>
                <p className="text-xs text-muted-foreground mt-1">6.2% do total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faltas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">83</div>
                <p className="text-xs text-muted-foreground mt-1">8.9% do total</p>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: 'currentColor' }} />
                    <YAxis tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 240)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="realizadas"
                      fill="oklch(0.55 0.15 220)"
                      radius={[4, 4, 0, 0]}
                      name="Realizadas"
                    />
                    <Bar
                      dataKey="canceladas"
                      fill="oklch(0.75 0.15 85)"
                      radius={[4, 4, 0, 0]}
                      name="Canceladas"
                    />
                    <Bar
                      dataKey="faltas"
                      fill="oklch(0.55 0.2 25)"
                      radius={[4, 4, 0, 0]}
                      name="Faltas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="estoque" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Itens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Produtos cadastrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estoque Baixo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">4</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Itens abaixo do mínimo
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(3250)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimativa de valor
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Percentual de itens por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-87.5">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {stockCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
