"use client"

import { useState, useMemo } from "react"
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

type AppointmentStatus = "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou"
type AppointmentType = "presencial" | "online"

type Appointment = {
  id: string
  date: Date
  time: string
  patient: string
  professional: string
  type: AppointmentType
  status: AppointmentStatus
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    date: new Date(),
    time: "09:00",
    patient: "Ana Carolina Silva",
    professional: "Dr. Carlos Silva",
    type: "presencial",
    status: "confirmado",
  },
  {
    id: "2",
    date: new Date(),
    time: "10:30",
    patient: "João Pedro Santos",
    professional: "Dra. Maria Santos",
    type: "online",
    status: "agendado",
  },
  {
    id: "3",
    date: new Date(),
    time: "14:00",
    patient: "Maria Fernanda Lima",
    professional: "Dr. Carlos Silva",
    type: "presencial",
    status: "confirmado",
  },
  {
    id: "4",
    date: addDays(new Date(), 1),
    time: "09:00",
    patient: "Lucas Oliveira",
    professional: "Dra. Maria Santos",
    type: "online",
    status: "agendado",
  },
  {
    id: "5",
    date: addDays(new Date(), 1),
    time: "11:00",
    patient: "Beatriz Costa",
    professional: "Dr. Carlos Silva",
    type: "presencial",
    status: "agendado",
  },
  {
    id: "6",
    date: addDays(new Date(), 2),
    time: "10:00",
    patient: "Rafael Mendes",
    professional: "Dra. Maria Santos",
    type: "presencial",
    status: "agendado",
  },
  {
    id: "7",
    date: addDays(new Date(), -1),
    time: "15:00",
    patient: "Camila Rodrigues",
    professional: "Dr. Carlos Silva",
    type: "presencial",
    status: "realizado",
  },
  {
    id: "8",
    date: addDays(new Date(), -1),
    time: "16:30",
    patient: "Felipe Almeida",
    professional: "Dr. Carlos Silva",
    type: "online",
    status: "faltou",
  },
]

const patients = [
  "Ana Carolina Silva",
  "João Pedro Santos",
  "Maria Fernanda Lima",
  "Lucas Oliveira",
  "Beatriz Costa",
  "Rafael Mendes",
  "Camila Rodrigues",
  "Felipe Almeida",
]

const professionals = ["Dr. Carlos Silva", "Dra. Maria Santos"]

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
]

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    patient: "",
    professional: "",
    type: "presencial" as AppointmentType,
    status: "agendado" as AppointmentStatus,
  })

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => isSameDay(apt.date, selectedDate))
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, selectedDate])

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

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingAppointment) {
      setAppointments(
        appointments.map((apt) =>
          apt.id === editingAppointment.id
            ? {
                ...apt,
                date: new Date(formData.date),
                time: formData.time,
                patient: formData.patient,
                professional: formData.professional,
                type: formData.type,
                status: formData.status,
              }
            : apt
        )
      )
      toast.success("Agendamento atualizado com sucesso!")
    } else {
      const newAppointment: Appointment = {
        id: String(Date.now()),
        date: new Date(formData.date),
        time: formData.time,
        patient: formData.patient,
        professional: formData.professional,
        type: formData.type,
        status: formData.status,
      }
      setAppointments([...appointments, newAppointment])
      toast.success("Agendamento criado com sucesso!")
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      date: format(selectedDate, "yyyy-MM-dd"),
      time: "",
      patient: "",
      professional: "",
      type: "presencial",
      status: "agendado",
    })
    setEditingAppointment(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setFormData({
      date: format(appointment.date, "yyyy-MM-dd"),
      time: appointment.time,
      patient: appointment.patient,
      professional: appointment.professional,
      type: appointment.type,
      status: appointment.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id))
    toast.success("Agendamento excluído com sucesso!")
  }

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status } : apt
      )
    )
    toast.success("Status atualizado!")
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(apt.date, date))
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
            <Button onClick={() => {
              resetForm()
              setFormData((prev) => ({ ...prev, date: format(selectedDate, "yyyy-MM-dd") }))
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do atendimento
              </DialogDescription>
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
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário</Label>
                    <Select
                      value={formData.time}
                      onValueChange={(value) => setFormData({ ...formData, time: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                    value={formData.patient}
                    onValueChange={(value) => setFormData({ ...formData, patient: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient} value={patient}>
                          {patient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Select
                    value={formData.professional}
                    onValueChange={(value) => setFormData({ ...formData, professional: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof} value={prof}>
                          {prof}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: AppointmentType) =>
                        setFormData({ ...formData, type: value })
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
                      onValueChange={(value: AppointmentStatus) =>
                        setFormData({ ...formData, status: value })
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
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAppointment ? "Salvar" : "Agendar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                    <p className={`text-xs mt-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {dayAppointments.length} consulta{dayAppointments.length !== 1 ? "s" : ""}
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
            Atendimentos - {format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
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
                {filteredAppointments.length === 0 ? (
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
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "confirmado")}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "realizado")}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Marcar como Realizado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(appointment.id, "faltou")}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Paciente Faltou
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
