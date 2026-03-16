import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Filter, Download, Plus, Trash2 } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useServicosStore } from "@/stores/servicosStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: R$ {entry.value.toLocaleString("pt-BR")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Financeiro() {
  const { servicos, tecnicos } = useServicosStore();
  const [periodo, setPeriodo] = useState("mes");
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    valor: "",
    categoria: "geral",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Cálculos baseados nos dados reais do store
  const stats = useMemo(() => {
    // Faturamento total (serviços pagos)
    const faturamentoTotal = servicos
      .filter((s) => s.pago)
      .reduce((acc, s) => acc + s.valorTotal, 0);

    // Total pago a técnicos
    const totalPagoTecnicos = servicos.reduce((acc, s) => {
      return acc + s.tecnicos.reduce((tAcc, t) => tAcc + (t.pago ? t.valorPago : 0), 0);
    }, 0);

    // Lucro bruto
    const lucroBruto = faturamentoTotal - totalPagoTecnicos;

    return { faturamentoTotal, totalPagoTecnicos, lucroBruto };
  }, [servicos]);

  // Dados mensais para o gráfico de evolução
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyStats: Record<string, { faturamento: number; custoTecnicos: number; lucro: number }> = {};

    servicos.forEach((servico) => {
      const date = new Date(servico.data);
      const monthName = months[date.getMonth()];

      if (!monthlyStats[monthName]) {
        monthlyStats[monthName] = { faturamento: 0, custoTecnicos: 0, lucro: 0 };
      }

      if (servico.pago) {
        monthlyStats[monthName].faturamento += servico.valorTotal;
      }

      servico.tecnicos.forEach((t) => {
        if (t.pago) {
          monthlyStats[monthName].custoTecnicos += t.valorPago;
        }
      });
    });

    // Calcular lucro
    Object.keys(monthlyStats).forEach((month) => {
      monthlyStats[month].lucro = monthlyStats[month].faturamento - monthlyStats[month].custoTecnicos;
    });

    // Retornar apenas meses com dados ou os últimos 6 meses
    const result = months
      .map((mes) => ({
        mes,
        faturamento: monthlyStats[mes]?.faturamento || 0,
        custoTecnicos: monthlyStats[mes]?.custoTecnicos || 0,
        lucro: monthlyStats[mes]?.lucro || 0,
      }))
      .filter((m) => m.faturamento > 0 || m.custoTecnicos > 0);

    return result.length > 0 ? result : months.slice(0, 6).map((mes) => ({
      mes,
      faturamento: 0,
      custoTecnicos: 0,
      lucro: 0,
    }));
  }, [servicos]);

  // Pagamentos por técnico (dados reais)
  const technicianPayments = useMemo(() => {
    const paymentsByTechnician: Record<string, { nome: string; valor: number }> = {};

    servicos.forEach((servico) => {
      servico.tecnicos.forEach((t) => {
        if (!paymentsByTechnician[t.tecnicoId]) {
          paymentsByTechnician[t.tecnicoId] = { nome: t.tecnicoNome, valor: 0 };
        }
        paymentsByTechnician[t.tecnicoId].valor += t.valorPago;
      });
    });

    return Object.values(paymentsByTechnician)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [servicos]);

  // Últimas transações (baseadas em serviços reais)
  const ultimasTransacoes = useMemo(() => {
    const transacoes: { tipo: string; descricao: string; valor: number; data: string }[] = [];

    servicos.forEach((servico) => {
      if (servico.pago) {
        transacoes.push({
          tipo: "entrada",
          descricao: `Pagamento - ${servico.cliente}`,
          valor: servico.valorTotal,
          data: new Date(servico.data).toLocaleDateString("pt-BR"),
        });
      }

      servico.tecnicos.forEach((t) => {
        if (t.pago) {
          transacoes.push({
            tipo: "saida",
            descricao: `Pagamento técnico - ${t.tecnicoNome}`,
            valor: t.valorPago,
            data: new Date(servico.data).toLocaleDateString("pt-BR"),
          });
        }
      });
    });

    // Ordenar por data (mais recente primeiro) e pegar as 5 primeiras
    return transacoes
      .sort((a, b) => {
        const dateA = a.data.split("/").reverse().join("-");
        const dateB = b.data.split("/").reverse().join("-");
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5);
  }, [servicos]);

  const handleAddDespesa = () => {
    if (!novaDespesa.descricao.trim() || !novaDespesa.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const despesa: Despesa = {
      id: Date.now().toString(),
      descricao: novaDespesa.descricao.trim(),
      valor: parseFloat(novaDespesa.valor),
      categoria: novaDespesa.categoria,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    setDespesas([despesa, ...despesas]);
    setNovaDespesa({ descricao: "", valor: "", categoria: "geral" });
    toast({
      title: "Despesa adicionada",
      description: `${despesa.descricao} - ${formatCurrency(despesa.valor)}`,
    });
  };

  const handleRemoveDespesa = (id: string) => {
    setDespesas(despesas.filter((d) => d.id !== id));
    toast({
      title: "Despesa removida",
      description: "A despesa foi excluída com sucesso",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
            <p className="text-muted-foreground mt-1">Controle financeiro completo</p>
          </div>
          <div className="flex gap-3">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Faturamento Total"
            value={formatCurrency(stats.faturamentoTotal)}
            icon={DollarSign}
            trend={{ value: 18.2, isPositive: true }}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Pago a Técnicos"
            value={formatCurrency(stats.totalPagoTecnicos)}
            icon={TrendingDown}
            trend={{ value: 8.5, isPositive: false }}
            variant="secondary"
            delay={0.1}
          />
          <StatCard
            title="Lucro Bruto"
            value={formatCurrency(stats.lucroBruto)}
            icon={TrendingUp}
            trend={{ value: 22.1, isPositive: true }}
            variant="accent"
            delay={0.2}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(24, 100%, 50%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                      <XAxis
                        dataKey="mes"
                        stroke="hsl(0, 0%, 50%)"
                        tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                      />
                      <YAxis
                        stroke="hsl(0, 0%, 50%)"
                        tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                        tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="faturamento"
                        stroke="hsl(24, 100%, 50%)"
                        fillOpacity={1}
                        fill="url(#colorFaturamento)"
                        name="Faturamento"
                      />
                      <Area
                        type="monotone"
                        dataKey="lucro"
                        stroke="hsl(142, 76%, 36%)"
                        fillOpacity={1}
                        fill="url(#colorLucro)"
                        name="Lucro"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-lg">Pagamentos por Técnico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {technicianPayments.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={technicianPayments} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                        <XAxis
                          type="number"
                          stroke="hsl(0, 0%, 50%)"
                          tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                          tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="nome"
                          stroke="hsl(0, 0%, 50%)"
                          tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                          width={100}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="valor"
                          fill="hsl(195, 100%, 50%)"
                          radius={[0, 4, 4, 0]}
                          name="Valor Pago"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Nenhum pagamento registrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Card de Despesas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Adicionar Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    placeholder="Descrição da despesa"
                    value={novaDespesa.descricao}
                    onChange={(e) =>
                      setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    placeholder="0,00"
                    value={novaDespesa.valor}
                    onChange={(e) =>
                      setNovaDespesa({ ...novaDespesa, valor: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={novaDespesa.categoria}
                    onValueChange={(value) =>
                      setNovaDespesa({ ...novaDespesa, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="combustivel">Combustível</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddDespesa} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Despesa
              </Button>

              {/* Lista de Despesas */}
              {despesas.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-foreground">Despesas Registradas</h4>
                  {despesas.map((despesa) => (
                    <motion.div
                      key={despesa.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive/20">
                          <TrendingDown className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{despesa.descricao}</p>
                          <p className="text-sm text-muted-foreground">
                            {despesa.categoria} • {despesa.data}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-destructive">
                          -{formatCurrency(despesa.valor)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDespesa(despesa.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ultimasTransacoes.length > 0 ? (
                  ultimasTransacoes.map((transacao, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transacao.tipo === "entrada"
                              ? "bg-success/20"
                              : "bg-destructive/20"
                          }`}
                        >
                          {transacao.tipo === "entrada" ? (
                            <TrendingUp className="w-5 h-5 text-success" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transacao.descricao}</p>
                          <p className="text-sm text-muted-foreground">{transacao.data}</p>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-semibold ${
                          transacao.tipo === "entrada" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {transacao.tipo === "entrada" ? "+" : "-"}
                        {formatCurrency(transacao.valor)}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma transação registrada ainda.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
