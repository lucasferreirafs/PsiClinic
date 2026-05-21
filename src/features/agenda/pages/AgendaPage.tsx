"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  Ban,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PendingAppointmentsAlert } from "@/components/pending-appointments-alert"

type AppointmentStatus = "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou"
type AppointmentType = "presencial" | "online"

type Appointment = {
  id: string
  date: Date
  time: string
  patient: string
  professional: string
  pacienteId: string
  profissionalId: string
  type: AppointmentType
  status: AppointmentStatus
  observacoes?: string
}

type PatientOption = { id: string; nome_completo: string }
type ProfessionalOption = { id: string; nome: string }

type FormData = {
  date: string
  time: string
  pacienteId: string
  profissionalId: string
  type: AppointmentType
  status: AppointmentStatus
  observacoes: string
}

const EMPTY_FORM: FormData = {
  date: format(new Date(), "yyyy-MM-dd"),
  time: "",
  pacienteId: "",
  profissionalId: "",
  type: "presencial",
  status: "agendado",
  observacoes: "",
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
]

const STATUS_MAP: Record<string, AppointmentStatus> = {
  confirmar: "confirmado",
  cancelar: "cancelado",
  realizar: "realizado",
  falta: "faltou",
}

function mapApiToAppointment(item: Record<string, string>): Appointment {
  return {
    id: item.id,
    date: new Date(item.data_atendimento + "T00:00:00"),
    time: (item.hora_atendimento ?? "").slice(0, 5),
    patient: item.paciente,
    professional: item.profissional,
    pacienteId: item.paciente_id,
    profissionalId: item.profissional_id,
    type: item.tipo as AppointmentType,
    status: item.status as AppointmentStatus,
    observacoes: item.observacoes ?? undefined,
  }
}

export function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patientsList, setPatientsList] = useState<PatientOption[]>([])
  const [professionalsList, setProfessionalsList] = useState<ProfessionalOption[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const fetchAppointments = useCallback(async () => {
    setLoadingAppointments(true)
    try {
      const res = await fetch("/api/agenda")
      const json = await res.json()
      if (json.success) {
        setAppointments(json.data.map(mapApiToAppointment))
      } else {
        toast.error(json.message ?? "Erro ao carregar agenda")
      }
    } catch {
      toast.error("Erro de conexão ao carregar agenda")
    } finally {
      setLoadingAppointments(false)
    }
  }, [])

  const handleStatusResolved = useCallback((id: string, acao: string) => {
    const newStatus = STATUS_MAP[acao]
    if (newStatus) {
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      )
    }
  }, [])

  useEffect(() => {
    fetchAppointments()

    fetch("/api/pacientes")
      .then((r) => r.json())
      .then((json) => { if (json.success) setPatientsList(json.data) })
      .catch(() => toast.error("Erro ao carregar lista de pacientes"))

    fetch("/api/profissionais")
      .then((r) => r.json())
      .then((json) => { if (json.success) setProfessionalsList(json.data) })
      .catch(() => toast.error("Erro ao carregar lista de profissionais"))
  }, [fetchAppointments])

  // â”€â”€ Validação de data/hora â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const isPastDate = !editingAppointment && formData.date < todayStr
  const isSelectedToday = formData.date === todayStr

  // Horários disponíveis: filtra slots passados + janela de 2h para hoje
  const availableSlots = useMemo(() => {
    if (editingAppointment) return timeSlots
    if (formData.date !== format(new Date(), "yyyy-MM-dd")) return timeSlots
    const minTime = Date.now() + 2 * 60 * 60 * 1000 // now + 2 h
    return timeSlots.filter((slot) => {
      const [h, m] = slot.split(":").map(Number)
      const slotDate = new Date()
      slotDate.setHours(h, m, 0, 0)
      return slotDate.getTime() >= minTime
    })
  }, [formData.date, editingAppointment])

  // Quando a data muda, invalida o horário se ele não estiver mais disponível
  const handleDateChange = (newDate: string) => {
    let newTime = formData.time
    if (!editingAppointment && newDate === format(new Date(), "yyyy-MM-dd") && newTime) {
      const [h, m] = newTime.split(":").map(Number)
      const slotDate = new Date()
      slotDate.setHours(h, m, 0, 0)
      if (slotDate.getTime() < Date.now() + 2 * 60 * 60 * 1000) {
        newTime = ""
      }
    }
    setFormData({ ...formData, date: newDate, time: newTime })
  }
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => isSameDay(apt.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, selectedDate])

  const getAppointmentsForDay = (date: Date) =>
    appointments.filter((apt) => isSameDay(apt.date, date))

  const getStatusBadge = (status: AppointmentStatus) => {
    const styles: Record<AppointmentStatus, string> = {
      agendado: "bg-primary/10 text-primary border-primary/20",
      confirmado: "bg-accent/10 text-accent-foreground border-accent/20",
      realizado: "bg-muted text-muted-foreground",
      cancelado: "bg-destructive/10 text-destructive border-destructive/20",
      faltou: "bg-warning/10 text-warning-foreground border-warning/20",
    }
    const labels: Record<AppointmentStatus, string> = {
      agendado: "Agendado",
      confirmado: "Confirmado",
      realizado: "Realizado",
      cancelado: "Cancelado",
      faltou: "Faltou",
    }
    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAppointment) {
      const patientName = patientsList.find((p) => p.id === formData.pacienteId)?.nome_completo ?? editingAppointment.patient
      const profName = professionalsList.find((p) => p.id === formData.profissionalId)?.nome ?? editingAppointment.professional
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                time: formData.time,
                pacienteId: formData.pacienteId,
                patient: patientName,
                profissionalId: formData.profissionalId,
                professional: profName,
                type: formData.type,
                observacoes: formData.observacoes || undefined,
              }
            : apt
        )
      )
      toast.success("Agendamento atualizado!")
      resetForm()
      return
    }

    if (!formData.pacienteId || !formData.profissionalId || !formData.time) {
      toast.error("Preencha paciente, profissional e horário")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataAtendimento: formData.date,
          horaAtendimento: formData.time,
          pacienteId: formData.pacienteId,
          profissionalId: formData.profissionalId,
          tipo: formData.type,
          observacoes: formData.observacoes || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Atendimento agendado com sucesso!")
        resetForm()
        await fetchAppointments()
      } else {
        toast.error(json.message ?? "Erro ao criar agendamento")
      }
    } catch {
      toast.error("Erro de conexão ao criar agendamento")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM, date: format(selectedDate, "yyyy-MM-dd") })
    setEditingAppointment(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      date: format(appointment.date, "yyyy-MM-dd"),
      time: appointment.time,
      pacienteId: appointment.pacienteId,
      profissionalId: appointment.profissionalId,
      type: appointment.type,
      status: appointment.status,
      observacoes: appointment.observacoes ?? "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id))
    toast.success("Agendamento excluído!")
  }

  const handleStatusChange = async (id: string, acao: string) => {
    setStatusLoading(id)
    try {
      const res = await fetch("/api/agenda/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendaId: id, acao }),
      })
      const json = await res.json()
      if (json.success) {
        const newStatus = STATUS_MAP[acao]
        if (newStatus) {
          setAppointments(
            appointments.map((apt) =>
              apt.id === id ? { ...apt, status: newStatus } : apt
            )
          )
        }
        toast.success("Status atualizado!")
      } else {
        toast.error(json.message ?? "Erro ao atualizar status")
      }
    } catch {
      toast.error("Erro de conexão ao atualizar status")
    } finally {
      setStatusLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie os atendimentos da clínica
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setFormData((prev) => ({ ...prev, date: format(selectedDate, "yyyy-MM-dd") }))
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>Preencha os dados do atendimento</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(v) => setFormData({ ...formData, time: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.length === 0 ? (
                          <SelectItem value="_sem_horario" disabled>
                            Sem horários disponíveis hoje
                          </SelectItem>
                        ) : (
                          availableSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={formData.pacienteId}
                    onValueChange={(v) => setFormData({ ...formData, pacienteId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsList.length === 0 ? (
                        <SelectItem value="_empty" disabled>
                          Nenhum paciente cadastrado
                        </SelectItem>
                      ) : (
                        patientsList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome_completo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Select
                    value={formData.profissionalId}
                    onValueChange={(v) => setFormData({ ...formData, profissionalId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionalsList.length === 0 ? (
                        <SelectItem value="_empty" disabled>
                          Nenhum profissional cadastrado
                        </SelectItem>
                      ) : (
                        professionalsList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v: AppointmentType) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Presencial
                          </div>
                        </SelectItem>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Online
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: AppointmentStatus) =>
                        setFormData({ ...formData, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="realizado">Realizado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="faltou">Faltou</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Observações opcionais"
                  />
                </div>
              </div>
              {isPastDate && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  Não é possível agendar para uma data no passado.
                </div>
              )}

              {isSelectedToday && availableSlots.length === 0 && !editingAppointment && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  Não há horários disponíveis para hoje (mínimo 2 h de antecedência).
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    isPastDate ||
                    (!editingAppointment && isSelectedToday && availableSlots.length === 0)
                  }
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAppointment ? "Salvar" : "Agendar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <PendingAppointmentsAlert
        onPendingIdsChange={setPendingIds}
        onStatusResolved={handleStatusResolved}
      />

      {/* Calendar Week View */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Calendário</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-50 text-center">
                {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{" "}
                {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setWeekStart(addDays(weekStart, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAppointments = getAppointmentsForDay(day)
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-primary/10 hover:bg-primary/20"
                      : "hover:bg-secondary"
                  }`}
                >
                  <p className="text-xs uppercase font-medium opacity-70">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p className="text-lg font-bold">{format(day, "d")}</p>
                  {dayAppointments.length > 0 && (
                    <p
                      className={`text-xs mt-1 ${
                        isSelected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {dayAppointments.length} consulta
                      {dayAppointments.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atendimentos â€”{" "}
            {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
          </CardTitle>
          <CardDescription>
            {filteredAppointments.length} atendimento(s) agendado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Horário</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Profissional</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-25">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingAppointments ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando atendimentos...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum atendimento agendado para este dia.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(appointment.patient)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{appointment.patient}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {appointment.professional}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {appointment.type === "online" ? (
                            <Video className="h-4 w-4 text-primary" />
                          ) : (
                            <MapPin className="h-4 w-4 text-accent" />
                          )}
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {pendingIds.has(appointment.id) && (
                            <AlertTriangle
                              className="h-4 w-4 text-amber-500 shrink-0"
                              aria-label="Pendente de confirmação"
                            />
                          )}
                          {getStatusBadge(appointment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={statusLoading === appointment.id}
                            >
                              {statusLoading === appointment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "confirmar")
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "realizar")
                              }
                            >
                              <User className="mr-2 h-4 w-4" />
                              Marcar como Realizado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "falta")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Paciente Faltou
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(appointment.id, "cancelar")
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(appointment)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(appointment.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}

