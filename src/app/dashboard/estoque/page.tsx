"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
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
import { toast } from "sonner"

type StockItem = {
  id: string
  product: string
  category: string
  currentQuantity: number
  minQuantity: number
  entryDate: string
  supplier: string
}

const mockStockItems: StockItem[] = [
  {
    id: "1",
    product: "Lenços de papel",
    category: "Descartáveis",
    currentQuantity: 3,
    minQuantity: 10,
    entryDate: "2024-05-15",
    supplier: "Fornecedor ABC",
  },
  {
    id: "2",
    product: "Água mineral 500ml",
    category: "Bebidas",
    currentQuantity: 5,
    minQuantity: 20,
    entryDate: "2024-05-20",
    supplier: "Distribuidora XYZ",
  },
  {
    id: "3",
    product: "Café em pó 500g",
    category: "Bebidas",
    currentQuantity: 2,
    minQuantity: 5,
    entryDate: "2024-05-25",
    supplier: "Distribuidora XYZ",
  },
  {
    id: "4",
    product: "Papel A4 (resma)",
    category: "Escritório",
    currentQuantity: 15,
    minQuantity: 10,
    entryDate: "2024-06-01",
    supplier: "Papelaria Central",
  },
  {
    id: "5",
    product: "Canetas esferográficas",
    category: "Escritório",
    currentQuantity: 25,
    minQuantity: 20,
    entryDate: "2024-06-01",
    supplier: "Papelaria Central",
  },
  {
    id: "6",
    product: "Álcool em gel 500ml",
    category: "Higiene",
    currentQuantity: 8,
    minQuantity: 5,
    entryDate: "2024-06-05",
    supplier: "Fornecedor ABC",
  },
  {
    id: "7",
    product: "Copos descartáveis 180ml",
    category: "Descartáveis",
    currentQuantity: 50,
    minQuantity: 100,
    entryDate: "2024-06-10",
    supplier: "Fornecedor ABC",
  },
  {
    id: "8",
    product: "Chá variado (caixa)",
    category: "Bebidas",
    currentQuantity: 10,
    minQuantity: 5,
    entryDate: "2024-06-12",
    supplier: "Distribuidora XYZ",
  },
]

const categories = [
  "Descartáveis",
  "Bebidas",
  "Escritório",
  "Higiene",
  "Limpeza",
  "Outros",
]

const suppliers = [
  "Fornecedor ABC",
  "Distribuidora XYZ",
  "Papelaria Central",
  "Atacadão Geral",
]

export default function EstoquePage() {
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems)
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

  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const lowStockCount = stockItems.filter(
    (item) => item.currentQuantity < item.minQuantity
  ).length

  const isLowStock = (item: StockItem) => item.currentQuantity < item.minQuantity

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      setStockItems(
        stockItems.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                product: formData.product,
                category: formData.category,
                currentQuantity: Number(formData.currentQuantity),
                minQuantity: Number(formData.minQuantity),
                entryDate: formData.entryDate,
                supplier: formData.supplier,
              }
            : item
        )
      )
      toast.success("Item atualizado com sucesso!")
    } else {
      const newItem: StockItem = {
        id: String(Date.now()),
        product: formData.product,
        category: formData.category,
        currentQuantity: Number(formData.currentQuantity),
        minQuantity: Number(formData.minQuantity),
        entryDate: formData.entryDate,
        supplier: formData.supplier,
      }
      setStockItems([newItem, ...stockItems])
      toast.success("Item adicionado ao estoque!")
    }

    resetForm()
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
      supplier: item.supplier,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setStockItems(stockItems.filter((item) => item.id !== id))
    toast.success("Item removido do estoque!")
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
                    <Select
                      value={formData.supplier}
                      onValueChange={(value) =>
                        setFormData({ ...formData, supplier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup} value={sup}>
                            {sup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentQuantity">Quantidade Atual</Label>
                    <Input
                      id="currentQuantity"
                      type="number"
                      min="0"
                      value={formData.currentQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, currentQuantity: e.target.value })
                      }
                      placeholder="0"
                      required
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
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produtos cadastrados
            </p>
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
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens abaixo do mínimo
            </p>
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
              {new Set(stockItems.map((i) => i.category)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Categorias diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredItems.length} produto(s) no estoque
          </CardDescription>
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
                {categories.map((cat) => (
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
                      Nenhum item encontrado.
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
                            <AlertTriangle className="h-4 w-4 text-destructive" />
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
                        {new Date(item.entryDate).toLocaleDateString("pt-BR")}
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
    </div>
  )
}
