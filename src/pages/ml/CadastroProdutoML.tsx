import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMercadoLivreStore, calcularPrecoProduto } from "@/stores/mercadoLivreStore";
import { Plus, Package, Settings, DollarSign, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function CadastroProdutoML() {
  const navigate = useNavigate();
  const { configuracoesGlobais, addProduto } = useMercadoLivreStore();
  
  const [formData, setFormData] = useState({
    nome: "",
    custoProduto: 0,
    observacoes: "",
    usarConfigGlobais: true,
    taxaPercentual: configuracoesGlobais.taxaPercentual,
    taxaFixa: configuracoesGlobais.taxaFixa,
    custoEnvio: configuracoesGlobais.custoEnvio,
    custoEmbalagem: configuracoesGlobais.custoEmbalagem,
    margemMinima: configuracoesGlobais.margemMinima,
    margemIdeal: configuracoesGlobais.margemIdeal,
  });

  // Calcular preços em tempo real
  const calculos = calcularPrecoProduto(
    {
      id: "",
      nome: formData.nome,
      custoProduto: formData.custoProduto,
      usarConfigGlobais: formData.usarConfigGlobais,
      taxaPercentual: formData.taxaPercentual,
      taxaFixa: formData.taxaFixa,
      custoEnvio: formData.custoEnvio,
      custoEmbalagem: formData.custoEmbalagem,
      margemMinima: formData.margemMinima,
      margemIdeal: formData.margemIdeal,
      createdAt: "",
    },
    configuracoesGlobais
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do produto é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (formData.custoProduto <= 0) {
      toast({
        title: "Erro",
        description: "O custo do produto deve ser maior que zero.",
        variant: "destructive",
      });
      return;
    }

    addProduto({
      nome: formData.nome,
      custoProduto: formData.custoProduto,
      observacoes: formData.observacoes,
      usarConfigGlobais: formData.usarConfigGlobais,
      ...(formData.usarConfigGlobais
        ? {}
        : {
            taxaPercentual: formData.taxaPercentual,
            taxaFixa: formData.taxaFixa,
            custoEnvio: formData.custoEnvio,
            custoEmbalagem: formData.custoEmbalagem,
            margemMinima: formData.margemMinima,
            margemIdeal: formData.margemIdeal,
          }),
    });

    toast({
      title: "Produto cadastrado",
      description: `${formData.nome} foi adicionado com sucesso.`,
    });

    navigate("/ml/produtos");
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cadastrar Produto</h1>
            <p className="text-muted-foreground">
              Adicione um novo produto para cálculo de preço
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Dados do Produto
                </CardTitle>
                <CardDescription>
                  Preencha as informações do produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Capa para iPhone 15"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custo">Custo do Produto (R$) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="custo"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.custoProduto || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            custoProduto: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-10"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) =>
                        setFormData({ ...formData, observacoes: e.target.value })
                      }
                      placeholder="Informações adicionais sobre o produto..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="usarGlobais">Usar configurações globais</Label>
                    </div>
                    <Switch
                      id="usarGlobais"
                      checked={formData.usarConfigGlobais}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, usarConfigGlobais: checked })
                      }
                    />
                  </div>

                  {!formData.usarConfigGlobais && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 border border-border rounded-lg"
                    >
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Configurações Personalizadas
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Taxa Percentual (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.taxaPercentual}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taxaPercentual: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Taxa Fixa (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.taxaFixa}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                taxaFixa: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Custo Envio (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.custoEnvio}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                custoEnvio: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Custo Embalagem (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.custoEmbalagem}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                custoEmbalagem: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Margem Mínima (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.margemMinima}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                margemMinima: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Margem Ideal (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.margemIdeal}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                margemIdeal: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 gap-2">
                      <Plus className="w-4 h-4" />
                      Cadastrar Produto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/ml/produtos")}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Cálculo Automático
                </CardTitle>
                <CardDescription>
                  Preços calculados em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
                    <p className="text-lg font-semibold">{formatCurrency(calculos.custoTotal)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Preço Equilíbrio</p>
                    <p className="text-lg font-semibold text-accent">
                      {formatCurrency(calculos.precoEquilibrio)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-xs text-muted-foreground mb-1">Preço Mínimo (Margem {calculos.margemMinima}%)</p>
                  <p className="text-xl font-bold text-destructive">
                    {formatCurrency(calculos.precoMinimo)}
                  </p>
                </div>

                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-xs text-muted-foreground mb-1">Preço Ideal (Margem {calculos.margemIdeal}%)</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(calculos.precoIdeal)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Lucro Estimado</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(calculos.lucroEstimado)}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Margem Real</p>
                    <p className="text-lg font-semibold text-secondary">
                      {calculos.margemReal.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <p className="font-medium mb-2">Configurações aplicadas:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>Taxa ML: {calculos.taxaPercentual}%</span>
                    <span>Taxa fixa: {formatCurrency(calculos.taxaFixa)}</span>
                    <span>Envio: {formatCurrency(calculos.custoEnvio)}</span>
                    <span>Embalagem: {formatCurrency(calculos.custoEmbalagem)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
