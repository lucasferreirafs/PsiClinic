"use client"

import {
  Users,
  Calendar,
  DollarSign,
  TrendingDown,
  Package,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

const revenueData = [
  { month: "Jan", receitas: 12500, despesas: 4200 },
  { month: "Fev", receitas: 14200, despesas: 4800 },
  { month: "Mar", receitas: 15800, despesas: 5100 },
  { month: "Abr", receitas: 13900, despesas: 4500 },
  { month: "Mai", receitas: 16500, despesas: 5200 },
  { month: "Jun", receitas: 18200, despesas: 5500 },
]

const appointmentsData = [
  { day: "Seg", consultas: 8 },
  { day: "Ter", consultas: 12 },
  { day: "Qua", consultas: 10 },
  { day: "Qui", consultas: 14 },
  { day: "Sex", consultas: 9 },
  { day: "Sáb", consultas: 4 },
]

const upcomingAppointments = [
  {
    id: 1,
    patient: "Ana Carolina Silva",
    time: "09:00",
    type: "Presencial",
    status: "confirmado",
  },
  {
    id: 2,
    patient: "João Pedro Santos",
    time: "10:30",
    type: "Online",
    status: "agendado",
  },
  {
    id: 3,
    patient: "Maria Fernanda Lima",
    time: "14:00",
    type: "Presencial",
    status: "confirmado",
  },
  {
    id: 4,
    patient: "Lucas Oliveira",
    time: "15:30",
    type: "Online",
    status: "agendado",
  },
  {
    id: 5,
    patient: "Beatriz Costa",
    time: "17:00",
    type: "Presencial",
    status: "confirmado",
  },
]

const lowStockItems = [
  { name: "Lenços de papel", current: 3, min: 10 },
  { name: "Água mineral", current: 5, min: 20 },
  { name: "Café", current: 2, min: 5 },
]

export default function DashboardPage() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-accent/10 text-accent-foreground border-accent/20"
      case "agendado":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-accent" />
              <span className="text-accent">+12</span> este mês
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
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              5 confirmadas, 3 pendentes
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
            <div className="text-2xl font-bold">R$ 18.200</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-accent" />
              <span className="text-accent">+10.3%</span> vs mês anterior
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
            <div className="text-2xl font-bold">R$ 5.500</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-destructive" />
              <span className="text-destructive">+5.8%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas</CardTitle>
            <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-75">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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
                <BarChart data={appointmentsData}>
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
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
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
                        {appointment.time} - {appointment.type}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(appointment.status)}>
                    {appointment.status === "confirmado" ? "Confirmado" : "Agendado"}
                  </Badge>
                </div>
              ))}
            </div>
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
            {lowStockItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum item com estoque baixo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
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
