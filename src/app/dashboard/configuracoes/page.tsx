"use client"

import { useState } from "react"
import {
  Settings,
  Building,
  Bell,
  Palette,
  Save,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

export default function ConfiguracoesPage() {
  const [clinicData, setClinicData] = useState({
    name: "PsiClinic",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 99999-0000",
    email: "contato@psiclinic.com",
    address: "Rua das Flores, 123 - Centro - São Paulo/SP",
    description: "Clínica especializada em saúde mental e bem-estar emocional.",
  })

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailCancellations: true,
    smsReminders: false,
    lowStockAlerts: true,
    financialReports: true,
  })

  const [theme, setTheme] = useState("light")
  const [language, setLanguage] = useState("pt-BR")

  const handleSaveClinic = () => {
    toast.success("Dados da clínica salvos com sucesso!")
  }

  const handleSaveNotifications = () => {
    toast.success("Preferências de notificação atualizadas!")
  }

  const handleSaveAppearance = () => {
    toast.success("Configurações de aparência salvas!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Clinic Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Dados da Clínica
          </CardTitle>
          <CardDescription>
            Informações gerais da clínica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Nome da Clínica</Label>
              <Input
                id="clinicName"
                value={clinicData.name}
                onChange={(e) =>
                  setClinicData({ ...clinicData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={clinicData.cnpj}
                onChange={(e) =>
                  setClinicData({ ...clinicData, cnpj: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clinicPhone">Telefone</Label>
              <Input
                id="clinicPhone"
                value={clinicData.phone}
                onChange={(e) =>
                  setClinicData({ ...clinicData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicEmail">Email</Label>
              <Input
                id="clinicEmail"
                type="email"
                value={clinicData.email}
                onChange={(e) =>
                  setClinicData({ ...clinicData, email: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={clinicData.address}
              onChange={(e) =>
                setClinicData({ ...clinicData, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={clinicData.description}
              onChange={(e) =>
                setClinicData({ ...clinicData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveClinic}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações de Agendamentos</Label>
              <p className="text-sm text-muted-foreground">
                Receber email quando novos agendamentos forem criados
              </p>
            </div>
            <Switch
              checked={notifications.emailAppointments}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailAppointments: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações de Cancelamentos</Label>
              <p className="text-sm text-muted-foreground">
                Receber email quando agendamentos forem cancelados
              </p>
            </div>
            <Switch
              checked={notifications.emailCancellations}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailCancellations: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembretes por SMS</Label>
              <p className="text-sm text-muted-foreground">
                Enviar SMS de lembrete aos pacientes
              </p>
            </div>
            <Switch
              checked={notifications.smsReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, smsReminders: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Estoque Baixo</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificação quando itens estiverem abaixo do mínimo
              </p>
            </div>
            <Switch
              checked={notifications.lowStockAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, lowStockAlerts: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Relatórios Financeiros</Label>
              <p className="text-sm text-muted-foreground">
                Receber resumo financeiro semanal por email
              </p>
            </div>
            <Switch
              checked={notifications.financialReports}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, financialReports: checked })
              }
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveNotifications}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Preferências
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
          <CardDescription>
            Personalize a aparência do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tema</Label>
              <p className="text-sm text-muted-foreground">
                Escolha entre tema claro ou escuro
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Escuro
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Idioma</Label>
              <p className="text-sm text-muted-foreground">
                Selecione o idioma do sistema
              </p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-45">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveAppearance}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Versão do Sistema</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Última Atualização</p>
              <p className="text-sm text-muted-foreground">14 de maio de 2026</p>
            </div>
            <div>
              <p className="text-sm font-medium">Suporte</p>
              <p className="text-sm text-muted-foreground">suporte@psiclinic.com</p>
            </div>
            <div>
              <p className="text-sm font-medium">Documentação</p>
              <p className="text-sm text-muted-foreground">docs.psiclinic.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
