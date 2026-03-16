import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMercadoLivreStore, calcularPrecoProduto } from "@/stores/mercadoLivreStore";
import { Target, DollarSign, TrendingUp, ShoppingCart, Calculator, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function BreakEvenML() {
  const { produtos, configuracoesGlobais, breakEvenConfig, setBreakEvenConfig } =
    useMercadoLivreStore();

  // Calcular lucro médio por venda
  const lucrosUnitarios = produtos.map((p) => {
    const calc = calcularPrecoProduto(p, configuracoesGlobais);
    return calc.lucroEstimado;
  });

  const lucroMedioPorVenda =
    lucrosUnitarios.length > 0
      ? lucrosUnitarios.reduce((a, b) => a + b, 0) / lucrosUnitarios.length
      : 0;

  // Calcular vendas necessárias
  const vendasParaEmpatar =
    lucroMedioPorVenda > 0
      ? Math.ceil(breakEvenConfig.custoFixoMensal / lucroMedioPorVenda)
      : 0;

  const vendasParaLucro =
    lucroMedioPorVenda > 0
      ? Math.ceil(
          (breakEvenConfig.custoFixoMensal + breakEvenConfig.lucroDesejado) /
            lucroMedioPorVenda
        )
      : 0;

  // Calcular preço médio de venda
  const precosMedios = produtos.map((p) => {
    const calc = calcularPrecoProduto(p, configuracoesGlobais);
    return calc.precoIdeal;
  });

  const precoMedioVenda =
    precosMedios.length > 0
      ? precosMedios.reduce((a, b) => a + b, 0) / precosMedios.length
      : 0;

  // Faturamento necessário
  const faturamentoParaEmpatar = vendasParaEmpatar * precoMedioVenda;
  const faturamentoParaLucro = vendasParaLucro * precoMedioVenda;

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
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meta de Vendas</h1>
            <p className="text-muted-foreground">
              Calcule quantas vendas são necessárias para atingir suas metas
            </p>
          </div>
        </motion.div>

        {produtos.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="w-5 h-5 text-accent" />
                <p className="text-sm text-muted-foreground">
                  Cadastre produtos para calcular as metas de vendas com base no lucro médio.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Custos e Metas
                </CardTitle>
                <CardDescription>
                  Defina seus custos fixos e lucro desejado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="custoFixo" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Custos Fixos Mensais
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="custoFixo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={breakEvenConfig.custoFixoMensal || ""}
                      onChange={(e) =>
                        setBreakEvenConfig({
                          custoFixoMensal: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pl-10"
                      placeholder="Ex: 1500,00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Aluguel, luz, internet, ferramentas, etc.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lucroDesejado" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Lucro Mensal Desejado
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="lucroDesejado"
                      type="number"
                      step="0.01"
                      min="0"
                      value={breakEvenConfig.lucroDesejado || ""}
                      onChange={(e) =>
                        setBreakEvenConfig({
                          lucroDesejado: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="pl-10"
                      placeholder="Ex: 3000,00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Quanto você quer lucrar por mês
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Resumo dos Produtos</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Produtos cadastrados</p>
                      <p className="font-semibold">{produtos.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lucro médio/venda</p>
                      <p className="font-semibold text-success">
                        {formatCurrency(lucroMedioPorVenda)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preço médio</p>
                      <p className="font-semibold">{formatCurrency(precoMedioVenda)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Card Empatar */}
            <Card className="border-accent/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Para Empatar</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cobrir todos os custos fixos (break-even)
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-accent/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-accent" />
                          <span className="text-xs text-muted-foreground">Vendas</span>
                        </div>
                        <p className="text-3xl font-bold text-accent">
                          {vendasParaEmpatar}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Faturamento</span>
                        </div>
                        <p className="text-xl font-bold">
                          {formatCurrency(faturamentoParaEmpatar)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Lucrar */}
            <Card className="border-success/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Para Lucrar</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Cobrir custos + lucro desejado de {formatCurrency(breakEvenConfig.lucroDesejado)}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-success/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-success" />
                          <span className="text-xs text-muted-foreground">Vendas</span>
                        </div>
                        <p className="text-3xl font-bold text-success">
                          {vendasParaLucro}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Faturamento</span>
                        </div>
                        <p className="text-xl font-bold">
                          {formatCurrency(faturamentoParaLucro)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Média diária */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Média Diária Necessária</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1">Para Empatar</p>
                    <p className="text-2xl font-bold">
                      {(vendasParaEmpatar / 30).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">vendas/dia</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1">Para Lucrar</p>
                    <p className="text-2xl font-bold text-primary">
                      {(vendasParaLucro / 30).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">vendas/dia</p>
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
