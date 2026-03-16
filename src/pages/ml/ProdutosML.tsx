import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMercadoLivreStore, calcularPrecoProduto, ProdutoML } from "@/stores/mercadoLivreStore";
import { Package, Plus, Search, Trash2, Eye, AlertTriangle, TrendingUp, TrendingDown, Pencil, Save, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProdutosML() {
  const navigate = useNavigate();
  const { produtos, configuracoesGlobais, removeProduto, updateProduto } = useMercadoLivreStore();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProdutoML | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProdutoML | null>(null);
  const [editForm, setEditForm] = useState({
    nome: "",
    custoProduto: 0,
    observacoes: "",
    usarConfigGlobais: true,
    taxaPercentual: 0,
    taxaFixa: 0,
    custoEnvio: 0,
    custoEmbalagem: 0,
    margemMinima: 0,
    margemIdeal: 0,
  });

  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        nome: editingProduct.nome,
        custoProduto: editingProduct.custoProduto,
        observacoes: editingProduct.observacoes || "",
        usarConfigGlobais: editingProduct.usarConfigGlobais,
        taxaPercentual: editingProduct.taxaPercentual ?? configuracoesGlobais.taxaPercentual,
        taxaFixa: editingProduct.taxaFixa ?? configuracoesGlobais.taxaFixa,
        custoEnvio: editingProduct.custoEnvio ?? configuracoesGlobais.custoEnvio,
        custoEmbalagem: editingProduct.custoEmbalagem ?? configuracoesGlobais.custoEmbalagem,
        margemMinima: editingProduct.margemMinima ?? configuracoesGlobais.margemMinima,
        margemIdeal: editingProduct.margemIdeal ?? configuracoesGlobais.margemIdeal,
      });
    }
  }, [editingProduct, configuracoesGlobais]);

  const filteredProducts = produtos.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getStatusInfo = (margem: number) => {
    if (margem >= 20) {
      return {
        color: "text-success",
        bgColor: "bg-success/20",
        label: "Lucrativo",
        icon: TrendingUp,
      };
    } else if (margem >= 5) {
      return {
        color: "text-accent",
        bgColor: "bg-accent/20",
        label: "Margem Baixa",
        icon: AlertTriangle,
      };
    } else {
      return {
        color: "text-destructive",
        bgColor: "bg-destructive/20",
        label: "Prejuízo",
        icon: TrendingDown,
      };
    }
  };

  const handleDelete = (id: string, nome: string) => {
    removeProduto(id);
    toast({
      title: "Produto removido",
      description: `${nome} foi removido com sucesso.`,
    });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    if (!editForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (editForm.custoProduto <= 0) {
      toast({
        title: "Erro",
        description: "O custo do produto deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    updateProduto(editingProduct.id, {
      nome: editForm.nome,
      custoProduto: editForm.custoProduto,
      observacoes: editForm.observacoes,
      usarConfigGlobais: editForm.usarConfigGlobais,
      ...(editForm.usarConfigGlobais
        ? {
            taxaPercentual: undefined,
            taxaFixa: undefined,
            custoEnvio: undefined,
            custoEmbalagem: undefined,
            margemMinima: undefined,
            margemIdeal: undefined,
          }
        : {
            taxaPercentual: editForm.taxaPercentual,
            taxaFixa: editForm.taxaFixa,
            custoEnvio: editForm.custoEnvio,
            custoEmbalagem: editForm.custoEmbalagem,
            margemMinima: editForm.margemMinima,
            margemIdeal: editForm.margemIdeal,
          }),
    });

    toast({
      title: "Produto atualizado",
      description: `${editForm.nome} foi atualizado com sucesso.`,
    });

    setEditingProduct(null);
  };

  const selectedCalc = selectedProduct
    ? calcularPrecoProduto(selectedProduct, configuracoesGlobais)
    : null;

  // Cálculo em tempo real para o modal de edição
  const editCalc = editingProduct
    ? calcularPrecoProduto(
        {
          ...editingProduct,
          nome: editForm.nome,
          custoProduto: editForm.custoProduto,
          usarConfigGlobais: editForm.usarConfigGlobais,
          taxaPercentual: editForm.taxaPercentual,
          taxaFixa: editForm.taxaFixa,
          custoEnvio: editForm.custoEnvio,
          custoEmbalagem: editForm.custoEmbalagem,
          margemMinima: editForm.margemMinima,
          margemIdeal: editForm.margemIdeal,
        },
        configuracoesGlobais
      )
    : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
              <p className="text-muted-foreground">
                {produtos.length} produto{produtos.length !== 1 ? "s" : ""} cadastrado{produtos.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/ml/cadastrar")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Lista de Produtos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie seus produtos
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {search
                      ? "Tente buscar por outro termo"
                      : "Comece cadastrando seu primeiro produto"}
                  </p>
                  {!search && (
                    <Button onClick={() => navigate("/ml/cadastrar")} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Cadastrar Produto
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Custo</TableHead>
                        <TableHead className="text-right">Preço Ideal</TableHead>
                        <TableHead className="text-right">Margem</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((produto, index) => {
                        const calc = calcularPrecoProduto(produto, configuracoesGlobais);
                        const status = getStatusInfo(calc.margemReal);
                        const StatusIcon = status.icon;

                        return (
                          <motion.tr
                            key={produto.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{produto.nome}</p>
                                {produto.observacoes && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {produto.observacoes}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(produto.custoProduto)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium text-success">
                              {formatCurrency(calc.precoIdeal)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {calc.margemReal.toFixed(1)}%
                            </TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                  status.bgColor,
                                  status.color
                                )}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedProduct(produto)}
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingProduct(produto)}
                                  title="Editar"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(produto.id, produto.nome)}
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.nome}</DialogTitle>
            <DialogDescription>
              Detalhes do cálculo de preço
            </DialogDescription>
          </DialogHeader>
          {selectedCalc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Custo Produto</p>
                  <p className="font-semibold">{formatCurrency(selectedProduct?.custoProduto || 0)}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                  <p className="font-semibold">{formatCurrency(selectedCalc.custoTotal)}</p>
                </div>
              </div>

              <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-xs text-muted-foreground">Preço de Equilíbrio</p>
                <p className="text-lg font-bold text-accent">{formatCurrency(selectedCalc.precoEquilibrio)}</p>
              </div>

              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-xs text-muted-foreground">Preço Mínimo (Margem {selectedCalc.margemMinima}%)</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(selectedCalc.precoMinimo)}</p>
              </div>

              <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                <p className="text-xs text-muted-foreground">Preço Ideal (Margem {selectedCalc.margemIdeal}%)</p>
                <p className="text-xl font-bold text-success">{formatCurrency(selectedCalc.precoIdeal)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Lucro Estimado</p>
                  <p className="font-semibold text-primary">{formatCurrency(selectedCalc.lucroEstimado)}</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Margem Real</p>
                  <p className="font-semibold text-secondary">{selectedCalc.margemReal.toFixed(2)}%</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                <p className="font-medium mb-1">Configurações:</p>
                <p>Taxa ML: {selectedCalc.taxaPercentual}% | Taxa fixa: {formatCurrency(selectedCalc.taxaFixa)}</p>
                <p>Envio: {formatCurrency(selectedCalc.custoEnvio)} | Embalagem: {formatCurrency(selectedCalc.custoEmbalagem)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Editar Produto
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome do Produto *</Label>
                <Input
                  id="edit-nome"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-custo">Custo do Produto (R$) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    id="edit-custo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.custoProduto || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        custoProduto: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-obs">Observações</Label>
                <Textarea
                  id="edit-obs"
                  value={editForm.observacoes}
                  onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="edit-globais">Usar configurações globais</Label>
                </div>
                <Switch
                  id="edit-globais"
                  checked={editForm.usarConfigGlobais}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, usarConfigGlobais: checked })
                  }
                />
              </div>

              {!editForm.usarConfigGlobais && (
                <div className="space-y-3 p-3 border border-border rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Configurações Personalizadas</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.taxaPercentual}
                        onChange={(e) =>
                          setEditForm({ ...editForm, taxaPercentual: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Taxa Fixa</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.taxaFixa}
                        onChange={(e) =>
                          setEditForm({ ...editForm, taxaFixa: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Envio</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.custoEnvio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, custoEnvio: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Embalagem</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.custoEmbalagem}
                        onChange={(e) =>
                          setEditForm({ ...editForm, custoEmbalagem: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Margem Mín %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.margemMinima}
                        onChange={(e) =>
                          setEditForm({ ...editForm, margemMinima: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Margem Ideal %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editForm.margemIdeal}
                        onChange={(e) =>
                          setEditForm({ ...editForm, margemIdeal: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview dos cálculos */}
            {editCalc && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Prévia dos Cálculos</p>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Custo Total</p>
                  <p className="font-semibold">{formatCurrency(editCalc.custoTotal)}</p>
                </div>

                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted-foreground">Preço Equilíbrio</p>
                  <p className="text-lg font-bold text-accent">{formatCurrency(editCalc.precoEquilibrio)}</p>
                </div>

                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-xs text-muted-foreground">Preço Mínimo</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(editCalc.precoMinimo)}</p>
                </div>

                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-muted-foreground">Preço Ideal</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(editCalc.precoIdeal)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className="font-semibold text-primary">{formatCurrency(editCalc.lucroEstimado)}</p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Margem</p>
                    <p className="font-semibold text-secondary">{editCalc.margemReal.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleSaveEdit} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
