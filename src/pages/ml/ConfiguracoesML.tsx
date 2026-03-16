import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMercadoLivreStore } from "@/stores/mercadoLivreStore";
import { Settings, Percent, DollarSign, Package, Truck, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ConfiguracoesML() {
  const { configuracoesGlobais, setConfiguracoesGlobais } = useMercadoLivreStore();

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações globais foram atualizadas com sucesso.",
    });
  };

  const configFields = [
    {
      key: "taxaPercentual",
      label: "Taxa Percentual do Mercado Livre",
      icon: Percent,
      suffix: "%",
      description: "Taxa cobrada sobre o valor da venda",
    },
    {
      key: "taxaFixa",
      label: "Taxa Fixa por Venda",
      icon: DollarSign,
      prefix: "R$",
      description: "Valor fixo cobrado por transação",
    },
    {
      key: "custoEnvio",
      label: "Custo Médio de Envio",
      icon: Truck,
      prefix: "R$",
      description: "Custo médio do frete por produto",
    },
    {
      key: "custoEmbalagem",
      label: "Custo de Embalagem",
      icon: Package,
      prefix: "R$",
      description: "Custo da embalagem por produto",
    },
    {
      key: "margemMinima",
      label: "Margem Mínima",
      icon: TrendingUp,
      suffix: "%",
      description: "Margem mínima aceitável de lucro",
    },
    {
      key: "margemIdeal",
      label: "Margem Ideal",
      icon: TrendingUp,
      suffix: "%",
      description: "Margem desejada de lucro",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações Globais</h1>
            <p className="text-muted-foreground">
              Defina os valores padrão para cálculo de preços
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Taxas e Custos Padrão</CardTitle>
              <CardDescription>
                Estes valores serão aplicados automaticamente a todos os produtos,
                a menos que sejam sobrescritos individualmente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configFields.map((field, index) => (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="space-y-2"
                  >
                    <Label className="flex items-center gap-2">
                      <field.icon className="w-4 h-4 text-muted-foreground" />
                      {field.label}
                    </Label>
                    <div className="relative">
                      {field.prefix && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {field.prefix}
                        </span>
                      )}
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={configuracoesGlobais[field.key as keyof typeof configuracoesGlobais]}
                        onChange={(e) =>
                          setConfiguracoesGlobais({
                            [field.key]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={field.prefix ? "pl-10" : field.suffix ? "pr-10" : ""}
                      />
                      {field.suffix && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex justify-end"
              >
                <Button onClick={handleSave} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Salvar Configurações
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
}
