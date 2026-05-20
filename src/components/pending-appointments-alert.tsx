"use client"

import { useState, useEffect, useCallback } from "react"
import { AlertTriangle, Loader2, CheckCircle, XCircle, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type PendingItem = {
  id: string
  data_atendimento: string
  hora_atendimento: string
  tipo: string
  status: string
  paciente: string
  profissional: string
}

interface PendingAppointmentsAlertProps {
  onPendingIdsChange?: (ids: Set<string>) => void
  onStatusResolved?: (id: string, acao: string) => void
}

export function PendingAppointmentsAlert({
  onPendingIdsChange,
  onStatusResolved,
}: PendingAppointmentsAlertProps) {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/agenda/pendentes")
      const json = await res.json()
      if (json.success) {
        setItems(json.data)
        onPendingIdsChange?.(new Set<string>(json.data.map((i: PendingItem) => i.id)))
      }
    } catch {
      // silently fail — alerta é não-crítico
    } finally {
      setLoading(false)
    }
  }, [onPendingIdsChange])

  useEffect(() => {
    void fetchPending()
  }, [fetchPending])

  const handleAction = async (id: string, acao: string) => {
    setActionLoading(`${id}::${acao}`)
    try {
      const res = await fetch("/api/agenda/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agendaId: id, acao }),
      })
      const json = await res.json()
      if (json.success) {
        const labels: Record<string, string> = {
          confirmar: "Consulta confirmada",
          realizar: "Marcado como realizado",
          falta: "Falta registrada",
          cancelar: "Consulta cancelada",
        }
        toast.success(labels[acao] ?? "Status atualizado!")
        onStatusResolved?.(id, acao)

        const newItems = items.filter((i) => i.id !== id)
        setItems(newItems)
        onPendingIdsChange?.(new Set<string>(newItems.map((i) => i.id)))

        if (newItems.length === 0) {
          setIsOpen(false)
        }
      } else {
        toast.error(json.message ?? "Erro ao atualizar status")
      }
    } catch {
      toast.error("Erro de conexão ao atualizar status")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading || items.length === 0) return null

  return (
    <>
      <Card className="border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-600/40">
        <CardContent className="flex flex-col gap-3 py-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Atenção: Você possui{" "}
              <span className="font-bold">{items.length}</span>{" "}
              atendimento{items.length !== 1 ? "s" : ""} de dias anteriores ou com
              horário próximo pendente{items.length !== 1 ? "s" : ""} de confirmação.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500 text-amber-800 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-200 dark:hover:bg-amber-900 shrink-0 self-start sm:self-auto"
            onClick={() => setIsOpen(true)}
          >
            Conciliar Atendimentos
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Conciliação de Atendimentos
            </DialogTitle>
            <DialogDescription>
              Resolva as pendências dos atendimentos abaixo. Cada ação atualiza o
              banco imediatamente e é irreversível.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {items.map((item) => {
              const date = new Date(item.data_atendimento + "T00:00:00")
              const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR })
              const hora = item.hora_atendimento.slice(0, 5)
              const isActing = actionLoading?.startsWith(`${item.id}::`)

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-card p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{item.paciente}</p>
                      <p className="text-xs text-muted-foreground">
                        {formattedDate} às {hora} —{" "}
                        <span className="capitalize">{item.tipo}</span> com{" "}
                        {item.profissional}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700 shrink-0"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.status === "agendado" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 border-blue-500 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950"
                        disabled={!!isActing}
                        onClick={() => handleAction(item.id, "confirmar")}
                      >
                        {actionLoading === `${item.id}::confirmar` ? (
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1.5" />
                        )}
                        Confirmar Consulta
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-green-500 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
                      disabled={!!isActing}
                      onClick={() => handleAction(item.id, "realizar")}
                    >
                      {actionLoading === `${item.id}::realizar` ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1.5" />
                      )}
                      Marcar como Realizado
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-amber-500 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
                      disabled={!!isActing}
                      onClick={() => handleAction(item.id, "falta")}
                    >
                      {actionLoading === `${item.id}::falta` ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1.5" />
                      )}
                      Paciente Faltou
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                      disabled={!!isActing}
                      onClick={() => handleAction(item.id, "cancelar")}
                    >
                      {actionLoading === `${item.id}::cancelar` ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : (
                        <Ban className="h-3 w-3 mr-1.5" />
                      )}
                      Cancelar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
