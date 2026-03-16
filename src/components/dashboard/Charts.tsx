import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServicosStore } from "@/stores/servicosStore";

const COLORS = [
  "hsl(24, 100%, 50%)",
  "hsl(195, 100%, 50%)",
  "hsl(45, 100%, 50%)",
  "hsl(142, 76%, 36%)",
  "hsl(0, 0%, 50%)",
];

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

export function RevenueByServiceChart() {
  const { servicos } = useServicosStore();

  const barData = useMemo(() => {
    const revenueByType: Record<string, number> = {};

    // Apenas serviços PAGOS são contabilizados
    servicos
      .filter((servico) => servico.pago)
      .forEach((servico) => {
        servico.servicos.forEach((s) => {
          const tipo = s.tipo || "Outros";
          if (!revenueByType[tipo]) {
            revenueByType[tipo] = 0;
          }
          revenueByType[tipo] += s.quantidade * s.valorUnitario;
        });
      });

    return Object.entries(revenueByType)
      .map(([name, valor]) => ({ name, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, [servicos]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Faturamento por Tipo de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(0, 0%, 50%)"
                    tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(0, 0%, 50%)"
                    tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
                    tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="valor"
                    fill="hsl(24, 100%, 50%)"
                    radius={[4, 4, 0, 0]}
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonthlyTrendChart() {
  const { servicos } = useServicosStore();

  const lineData = useMemo(() => {
    const monthlyData: Record<string, Record<string, number>> = {};
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Apenas serviços PAGOS são contabilizados
    servicos
      .filter((servico) => servico.pago)
      .forEach((servico) => {
        const date = new Date(servico.data);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];

        if (!monthlyData[monthName]) {
          monthlyData[monthName] = { instalacao: 0, manutencao: 0, higienizacao: 0 };
        }

        servico.servicos.forEach((s) => {
          const valor = s.quantidade * s.valorUnitario;
          const tipo = s.tipo.toLowerCase();

          if (tipo.includes("instalação") || tipo.includes("instalacao")) {
            monthlyData[monthName].instalacao += valor;
          } else if (tipo.includes("manutenção") || tipo.includes("manutencao")) {
            monthlyData[monthName].manutencao += valor;
          } else if (tipo.includes("higienização") || tipo.includes("higienizacao")) {
            monthlyData[monthName].higienizacao += valor;
          }
        });
      });

    // Get last 6 months with data
    const result = months
      .map((mes) => ({
        mes,
        instalacao: monthlyData[mes]?.instalacao || 0,
        manutencao: monthlyData[mes]?.manutencao || 0,
        higienizacao: monthlyData[mes]?.higienizacao || 0,
      }))
      .filter((m) => m.instalacao > 0 || m.manutencao > 0 || m.higienizacao > 0);

    return result.length > 0 ? result : months.slice(0, 6).map((mes) => ({
      mes,
      instalacao: 0,
      manutencao: 0,
      higienizacao: 0,
    }));
  }, [servicos]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Tendência Mensal por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="instalacao"
                  stroke="hsl(24, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(24, 100%, 50%)", strokeWidth: 2 }}
                  name="Instalação"
                />
                <Line
                  type="monotone"
                  dataKey="manutencao"
                  stroke="hsl(195, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(195, 100%, 50%)", strokeWidth: 2 }}
                  name="Manutenção"
                />
                <Line
                  type="monotone"
                  dataKey="higienizacao"
                  stroke="hsl(45, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(45, 100%, 50%)", strokeWidth: 2 }}
                  name="Higienização"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ServiceDistributionChart() {
  const { servicos } = useServicosStore();

  const pieData = useMemo(() => {
    const countByType: Record<string, number> = {};
    let total = 0;

    // Apenas serviços PAGOS são contabilizados
    servicos
      .filter((servico) => servico.pago)
      .forEach((servico) => {
        servico.servicos.forEach((s) => {
          const tipo = s.tipo || "Outros";
          if (!countByType[tipo]) {
            countByType[tipo] = 0;
          }
          countByType[tipo] += s.quantidade;
          total += s.quantidade;
        });
      });

    if (total === 0) {
      return [];
    }

    return Object.entries(countByType)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [servicos]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "hsl(0, 0%, 50%)" }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Participação"]}
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 10%)",
                      border: "1px solid hsl(0, 0%, 18%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
