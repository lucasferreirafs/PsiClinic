"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type StockItem = {
  id: string
  product: string
  category: string
  currentQuantity: number
  minQuantity: number
  entryDate: string
  supplier: string
  statusEstoque?: "CRÍTICO" | "NORMAL" | "INEXISTENTE"
}

type CriticalItem = {
  nome_produto: string
  quantidade_atual: number
  quantidade_minima: number
  fornecedor: string
}

const categories = [
  "Descartáveis",
  "Bebidas",
  "Escritório",
  "Higiene",
  "Limpeza",
  "Outros",
]

export function EstoquePage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [criticalItems, setCriticalItems] = useState<CriticalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [formData, setFormData] = useState({
    product: "",
    category: "",
    currentQuantity: "",
    minQuantity: "",
    entryDate: "",
    supplier: "",
  })
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [movingItem, setMovingItem] = useState<StockItem | null>(null)
  const [movementForm, setMovementForm] = useState({
    tipo: "entrada" as "entrada" | "saida",
    quantidade: "",
    observacao: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [stockRes, criticalRes] = await Promise.all([
        fetch("/api/estoque"),
        fetch("/api/estoque/critico"),
      ])
      const [stockData, criticalData] = await Promise.all([
        stockRes.json(),
        criticalRes.json(),
      ])

      if (stockData.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setStockItems(stockData.data.map((item: any) => ({
          id: item.id,
          product: item.nome_produto,
          category: item.categoria || "Outros",
          currentQuantity: Number(item.quantidade_atual),
          minQuantity: Number(item.quantidade_minima),
          entryDate: item.data_entrada ? String(item.data_entrada).substring(0, 10) : "",
          supplier: item.fornecedor || "â€”",
          statusEstoque: item.status_estoque,
        })))
      }

      if (criticalData.success) {
        setCriticalItems(criticalData.data)
      }
    } catch {
      toast.error("Erro ao carregar estoque")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const availableCategories = useMemo(
    () => [...new Set(stockItems.map((i) => i.category))].filter(Boolean).sort(),
    [stockItems]
  )

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const isLowStock = (item: StockItem) =>
    item.statusEstoque === "CRÍTICO" || item.currentQuantity < item.minQuantity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      if (editingItem) {
        const res = await fetch("/api/estoque", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingItem.id,
            nomeProduto: formData.product,
            categoria: formData.category,
            quantidadeMinima: Number(formData.minQuantity),
            fornecedor: formData.supplier,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          toast.error(data.message || "Erro ao atualizar item")
          return
        }
        toast.success("Item atualizado com sucesso!")
      } else {
        if (!formData.product.trim()) {
          toast.error("Informe o nome do produto")
          return
        }
        const res = await fetch("/api/estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nomeProduto: formData.product,
            categoria: formData.category,
            quantidadeAtual: Number(formData.currentQuantity) || 0,
            quantidadeMinima: Number(formData.minQuantity) || 0,
            fornecedor: formData.supplier,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          toast.error(data.message || "Erro ao cadastrar item")
          return
        }
        toast.success("Item adicionado ao estoque!")
      }

      resetForm()
      await loadData()
    } catch {
      toast.error("Erro ao salvar item")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      product: "",
      category: "",
      currentQuantity: "",
      minQuantity: "",
      entryDate: "",
      supplier: "",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: StockItem) => {
    setEditingItem(item)
    setFormData({
      product: item.product,
      category: item.category,
      currentQuantity: String(item.currentQuantity),
      minQuantity: String(item.minQuantity),
      entryDate: item.entryDate,
      supplier: item.supplier === "â€”" ? "" : item.supplier,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/estoque?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.message || "Erro ao remover item")
        return
      }
      toast.success("Item removido do estoque!")
      await loadData()
    } catch {
      toast.error("Erro ao remover item")
    }
  }

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!movingItem || submitting) return

    const quantidade = Number(movementForm.quantidade)
    if (!quantidade || !Number.isInteger(quantidade) || quantidade <= 0) {
      toast.error("Informe uma quantidade válida (número inteiro positivo)")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/estoque/movimentar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: movingItem.id,
          tipo: movementForm.tipo,
          quantidade,
          observacao: movementForm.observacao || null,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.message || "Erro ao registrar movimentação")
        return
      }

      toast.success(
        movementForm.tipo === "entrada"
          ? "Entrada registrada com sucesso!"
          : "Saída registrada com sucesso!"
      )
      setIsMovementDialogOpen(false)
      setMovingItem(null)
      setMovementForm({ tipo: "entrada", quantidade: "", observacao: "" })
      await loadData()
    } catch {
      toast.error("Erro ao registrar movimentação")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estoque</h1>
          <p className="text-muted-foreground">
            Controle de materiais e suprimentos da clínica
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item" : "Novo Item no Estoque"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Atualize as informações do item"
                  : "Adicione um novo item ao controle de estoque"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Produto</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) =>
                      setFormData({ ...formData, product: e.target.value })
                    }
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentQuantity">
                      Quantidade Atual
                      {editingItem && (
                        <span className="ml-1 text-xs text-muted-foreground">(use Movimentar)</span>
                      )}
                    </Label>
                    <Input
                      id="currentQuantity"
                      type="number"
                      min="0"
                      value={formData.currentQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, currentQuantity: e.target.value })
                      }
                      placeholder="0"
                      disabled={!!editingItem}
                      required={!editingItem}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Quantidade Mínima</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      min="0"
                      value={formData.minQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, minQuantity: e.target.value })
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryDate">Data de Entrada</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, entryDate: e.target.value })
                    }
                    disabled={!!editingItem}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {editingItem ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Critical stock alert */}
      {criticalItems.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-2 pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm font-semibold text-destructive">
                {criticalItems.length}{" "}
                {criticalItems.length === 1 ? "item com estoque" : "itens com estoque"} abaixo do
                mínimo
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-2">
              {criticalItems.map((item, i) => (
                <Badge key={i} variant="destructive" className="text-xs font-normal">
                  {item.nome_produto} â€” {Number(item.quantidade_atual)}/{Number(item.quantidade_minima)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "â€”" : stockItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loading ? "â€”" : criticalItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "â€”" : new Set(stockItems.map((i) => i.category)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Categorias diferentes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>{filteredItems.length} produto(s) no estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-45">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                  <TableHead>Qtd. Atual</TableHead>
                  <TableHead className="hidden md:table-cell">Qtd. Mínima</TableHead>
                  <TableHead className="hidden lg:table-cell">Data Entrada</TableHead>
                  <TableHead className="hidden md:table-cell">Fornecedor</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {loading ? "Carregando..." : "Nenhum item encontrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={isLowStock(item) ? "bg-destructive/5" : ""}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isLowStock(item) && (
                            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                          )}
                          <span className="font-medium">{item.product}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isLowStock(item)
                              ? "font-bold text-destructive"
                              : "font-medium"
                          }
                        >
                          {item.currentQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {item.minQuantity}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {item.entryDate
                          ? new Date(item.entryDate).toLocaleDateString("pt-BR")
                          : "â€”"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {item.supplier}
                      </TableCell>
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
                              onClick={() => {
                                setMovingItem(item)
                                setMovementForm({ tipo: "entrada", quantidade: "", observacao: "" })
                                setIsMovementDialogOpen(true)
                              }}
                            >
                              <ArrowUp className="mr-2 h-4 w-4 text-accent" />
                              Entrada
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setMovingItem(item)
                                setMovementForm({ tipo: "saida", quantidade: "", observacao: "" })
                                setIsMovementDialogOpen(true)
                              }}
                            >
                              <ArrowDown className="mr-2 h-4 w-4 text-destructive" />
                              Saída
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id)}
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

      {/* Movement Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
            <DialogDescription>
              {movingItem?.product}
              {movingItem && (
                <span className="ml-2 text-muted-foreground">
                  â€” Qtd. atual: <strong>{movingItem.currentQuantity}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovement}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={movementForm.tipo}
                  onValueChange={(value: "entrada" | "saida") =>
                    setMovementForm({ ...movementForm, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={movementForm.quantidade}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, quantidade: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Observação</Label>
                <Textarea
                  value={movementForm.observacao}
                  onChange={(e) =>
                    setMovementForm({ ...movementForm, observacao: e.target.value })
                  }
                  placeholder="Observação (opcional)"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsMovementDialogOpen(false)
                  setMovingItem(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

