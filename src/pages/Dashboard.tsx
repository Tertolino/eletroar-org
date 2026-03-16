import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ClipboardCheck, Target, AlertCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServicosStore } from "@/stores/servicosStore";
import {
  RevenueByServiceChart,
  MonthlyTrendChart,
  ServiceDistributionChart,
} from "@/components/dashboard/Charts";
import { WeeklyPlanner } from "@/components/dashboard/WeeklyPlanner";

export default function Dashboard() {
  const { servicos } = useServicosStore();

  const stats = useMemo(() => {
    // Faturamento total (APENAS serviços pagos pelo cliente)
    const faturamentoTotal = servicos
      .filter((s) => s.pago)
      .reduce((acc, s) => acc + s.valorTotal, 0);

    // Total pago a técnicos (apenas de serviços pagos)
    const totalTecnicos = servicos
      .filter((s) => s.pago)
      .reduce((acc, s) => {
        return acc + s.tecnicos.reduce((tAcc, t) => tAcc + (t.pago ? t.valorPago : 0), 0);
      }, 0);

    // Lucro bruto (baseado apenas em serviços pagos)
    const lucroBruto = faturamentoTotal - totalTecnicos;

    // Serviços realizados (concluídos E pagos)
    const servicosRealizados = servicos.filter((s) => s.status === "concluido" && s.pago).length;

    // Ticket médio (baseado em serviços pagos)
    const ticketMedio = servicosRealizados > 0 ? faturamentoTotal / servicosRealizados : 0;

    return [
      {
        title: "Faturamento Total",
        value: `R$ ${faturamentoTotal.toLocaleString("pt-BR")}`,
        icon: DollarSign,
        trend: { value: 12.5, isPositive: true },
        variant: "primary" as const,
      },
      {
        title: "Lucro Bruto",
        value: `R$ ${lucroBruto.toLocaleString("pt-BR")}`,
        icon: TrendingUp,
        trend: { value: 8.2, isPositive: true },
        variant: "secondary" as const,
      },
      {
        title: "Serviços Realizados",
        value: servicosRealizados.toString(),
        icon: ClipboardCheck,
        trend: { value: 5.4, isPositive: true },
        variant: "accent" as const,
      },
      {
        title: "Ticket Médio",
        value: `R$ ${ticketMedio.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
        icon: Target,
        trend: { value: 2.1, isPositive: ticketMedio > 0 },
        variant: "default" as const,
      },
    ];
  }, [servicos]);

  // Valores a receber (serviços não pagos)
  const valoresAReceber = useMemo(() => {
    return servicos
      .filter((s) => !s.pago && s.status !== "cancelado")
      .reduce((acc, s) => acc + s.valorTotal, 0);
  }, [servicos]);

  // Últimos serviços (5 mais recentes)
  const ultimosServicos = useMemo(() => {
    return [...servicos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((s) => ({
        cliente: s.cliente,
        tipo: s.servicos.map((serv) => serv.tipo).join(", ") || "Serviço",
        valor: `R$ ${s.valorTotal.toLocaleString("pt-BR")}`,
        status: s.status === "concluido" ? "Concluído" : s.status === "pendente" ? "Pendente" : s.status === "adiado" ? "Adiado" : "Cancelado",
      }));
  }, [servicos]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do desempenho da empresa
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.title}
              {...stat}
              delay={index * 0.1}
            />
          ))}
          <StatCard
            title="Valores a Receber"
            value={`R$ ${valoresAReceber.toLocaleString("pt-BR")}`}
            icon={AlertCircle}
            variant="default"
            delay={0.4}
          />
        </div>

        {/* Weekly Planner */}
        <WeeklyPlanner />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByServiceChart />
          <MonthlyTrendChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ServiceDistributionChart />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="stat-card p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Últimos Serviços
              </h3>
              <div className="space-y-3">
                {ultimosServicos.length > 0 ? (
                  ultimosServicos.map((servico, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{servico.cliente}</p>
                        <p className="text-sm text-muted-foreground">{servico.tipo}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{servico.valor}</p>
                        <span
                          className={`status-badge ${
                            servico.status === "Concluído" ? "status-success" : 
                            servico.status === "Cancelado" ? "status-error" : "status-pending"
                          }`}
                        >
                          {servico.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum serviço cadastrado ainda.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
