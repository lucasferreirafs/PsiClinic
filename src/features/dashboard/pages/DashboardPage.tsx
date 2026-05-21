"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users,
  Calendar,
  DollarSign,
  TrendingDown,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { PendingAppointmentsAlert } from "@/components/pending-appointments-alert"
import { toast } from "sonner"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface DashboardData {
  stats: {
    totalPacientes: number
    totalPacientesComparativo: string
    consultasHoje: number
    consultasHojeConfirmadas: number
    consultasHojePendentes: number
    receitasMes: number
    despesasMes: number
    receitasVariacao: string
    despesasVariacao: string
  }
  receitasDespesasChart: Array<{
    month: string
    receitas: number
    despesas: number
  }>
  consultasSemanaChart: Array<{
    day: string
    consultas: number
  }>
  proximosAtendimentos: Array<{
    id: string
    patient: string
    time: string
    type: string
    status: string
  }>
  estoqueBaixo: Array<{
    name: string
    current: number
    min: number
  }>
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/dashboard/resumo")
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || "Erro ao carregar dados do dashboard")
        toast.error(result.message || "Erro ao carregar dados do dashboard")
      }
    } catch (err) {
      console.error(err)
      setError("Erro de rede ao buscar dados do dashboard")
      toast.error("Erro de conexão ao carregar o dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
        return "bg-accent/10 text-accent-foreground border-accent/20"
      case "agendado":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case "realizado":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      case "cancelado":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "faltou":
        return "bg-muted text-muted-foreground border-muted-foreground/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
        return "Confirmado"
      case "agendado":
        return "Agendado"
      case "realizado":
        return "Realizado"
      case "cancelado":
        return "Cancelado"
      case "faltou":
        return "Faltou"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-secondary rounded" />
                <div className="h-4 w-4 bg-secondary rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-secondary rounded mb-2" />
                <div className="h-3 w-32 bg-secondary rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border-border/40">
              <CardHeader>
                <div className="h-5 w-36 bg-secondary rounded mb-2" />
                <div className="h-4 w-48 bg-secondary rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-75 bg-secondary/30 rounded flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse border-border/40">
              <CardHeader>
                <div className="h-5 w-40 bg-secondary rounded mb-2" />
                <div className="h-4 w-24 bg-secondary rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-14 bg-secondary/30 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h2 className="text-xl font-bold">Erro ao Carregar Dashboard</h2>
          <p className="text-muted-foreground text-sm max-w-md mt-1">
            Não conseguimos nos conectar ao banco de dados para gerar o resumo.
          </p>
        </div>
        <Button onClick={fetchDashboardData} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Tentar Novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da clínica para hoje,{" "}
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboardData} title="Atualizar dados">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <PendingAppointmentsAlert onStatusResolved={fetchDashboardData} />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pacientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-accent" />
              <span className="text-accent">{data.stats.totalPacientesComparativo}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.consultasHoje}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.stats.consultasHojeConfirmadas} confirmadas, {data.stats.consultasHojePendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.receitasMes)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {data.stats.receitasVariacao.startsWith("+") ? (
                <ArrowUpRight className="h-3 w-3 text-accent" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive" />
              )}
              <span className={data.stats.receitasVariacao.startsWith("+") ? "text-accent" : "text-destructive"}>
                {data.stats.receitasVariacao}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas do Mês
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.stats.despesasMes)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {data.stats.despesasVariacao.startsWith("-") ? (
                <ArrowDownRight className="h-3 w-3 text-accent" />
              ) : (
                <ArrowUpRight className="h-3 w-3 text-destructive" />
              )}
              <span className={data.stats.despesasVariacao.startsWith("-") ? "text-accent" : "text-destructive"}>
                {data.stats.despesasVariacao}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparativo dos últimos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.receitasDespesasChart}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 220)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 220)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.12 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.75 0.12 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.92 0.01 240)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                        maximumFractionDigits: 0,
                      }).format(value)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="oklch(0.55 0.15 220)"
                    fillOpacity={1}
                    fill="url(#colorReceitas)"
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="oklch(0.75 0.12 160)"
                    fillOpacity={1}
                    fill="url(#colorDespesas)"
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consultas da Semana</CardTitle>
            <CardDescription>Número de atendimentos por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.consultasSemanaChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" tick={{ fill: 'currentColor' }} />
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.92 0.01 240)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="consultas"
                    fill="oklch(0.55 0.15 220)"
                    radius={[4, 4, 0, 0]}
                    name="Consultas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Atendimentos</CardTitle>
                <CardDescription>Agenda de hoje</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {data.proximosAtendimentos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum atendimento agendado para hoje
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.proximosAtendimentos.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(appointment.patient)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{appointment.patient}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.time} - <span className="capitalize">{appointment.type}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Estoque Baixo</CardTitle>
                <CardDescription>Itens que precisam de reposição</CardDescription>
              </div>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {data.estoqueBaixo.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum item com estoque baixo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.estoqueBaixo.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Mínimo recomendado: {item.min} unidades
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.current} restantes
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

