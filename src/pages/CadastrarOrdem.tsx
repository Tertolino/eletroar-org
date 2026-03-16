import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServicosStore, ServicoItem, TecnicoServico } from "@/stores/servicosStore";
import { toast } from "sonner";

const TIPOS_SERVICO = [
  "Instalação",
  "Higienização",
  "Carga de Gás",
  "Manutenção Técnica",
  "Outro",
];

const FORMAS_PAGAMENTO = ["Pix", "Cartão", "Dinheiro", "Transferência"];

const PRECOS_BASE: Record<string, number> = {
  "Instalação": 400,
  "Higienização": 180,
  "Carga de Gás": 320,
  "Manutenção Técnica": 350,
  "Outro": 0,
};

interface FormErrors {
  cliente?: string;
  endereco?: string;
  data?: string;
  tecnicos?: string;
  servicos?: string;
}

export default function CadastrarOrdem() {
  const navigate = useNavigate();
  const { addServico, tecnicos } = useServicosStore();
  const tecnicosAtivos = tecnicos.filter((t) => t.ativo);

  // Form state
  const [cliente, setCliente] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contato, setContato] = useState("");
  const [data, setData] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Dynamic services
  const [servicosItems, setServicosItems] = useState<ServicoItem[]>([
    { id: "1", tipo: "", quantidade: 1, valorUnitario: 0 },
  ]);

  // Dynamic technicians
  const [tecnicosServico, setTecnicosServico] = useState<TecnicoServico[]>([
    { id: "1", tecnicoId: "", tecnicoNome: "", valorPago: 0, pago: false },
  ]);

  // Calculate total value
  const valorBruto = useMemo(() => {
    return servicosItems.reduce((acc, s) => acc + s.quantidade * s.valorUnitario, 0);
  }, [servicosItems]);

  const valorTotal = Math.max(0, valorBruto - desconto);

  // Service handlers
  const addServicoItem = () => {
    setServicosItems([
      ...servicosItems,
      { id: Date.now().toString(), tipo: "", quantidade: 1, valorUnitario: 0 },
    ]);
  };

  const removeServicoItem = (id: string) => {
    if (servicosItems.length > 1) {
      setServicosItems(servicosItems.filter((s) => s.id !== id));
    }
  };

  const updateServicoItem = (id: string, field: keyof ServicoItem, value: string | number) => {
    setServicosItems(
      servicosItems.map((s) => {
        if (s.id !== id) return s;
        
        const updated = { ...s, [field]: value };
        
        // Auto-fill price when type is selected
        if (field === "tipo" && typeof value === "string" && PRECOS_BASE[value]) {
          updated.valorUnitario = PRECOS_BASE[value];
        }
        
        return updated;
      })
    );
  };

  // Technician handlers
  const addTecnicoServico = () => {
    setTecnicosServico([
      ...tecnicosServico,
      { id: Date.now().toString(), tecnicoId: "", tecnicoNome: "", valorPago: 0, pago: false },
    ]);
  };

  const removeTecnicoServico = (id: string) => {
    if (tecnicosServico.length > 1) {
      setTecnicosServico(tecnicosServico.filter((t) => t.id !== id));
    }
  };

  const updateTecnicoServico = (id: string, field: keyof TecnicoServico, value: string | number | boolean) => {
    setTecnicosServico(
      tecnicosServico.map((t) => {
        if (t.id !== id) return t;
        
        const updated = { ...t, [field]: value };
        
        // Auto-fill name when technician is selected
        if (field === "tecnicoId" && typeof value === "string") {
          const tecnico = tecnicos.find((tec) => tec.id === value);
          if (tecnico) {
            updated.tecnicoNome = tecnico.nome;
          }
        }
        
        return updated;
      })
    );
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    setErrors(newErrors);
    return true;
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const filteredTecnicos = tecnicosServico.filter((t) => t.tecnicoId);
    const filteredServicos = servicosItems.filter((s) => s.tipo);

    addServico({
      cliente: cliente.trim(),
      endereco: endereco.trim(),
      contato: contato.trim(),
      data,
      tecnicos: filteredTecnicos,
      servicos: filteredServicos,
      valorTotal,
      desconto,
      formaPagamento: formaPagamento || "Pix",
      status: "pendente",
      pago: false,
      observacoes: observacoes.trim(),
    });

    toast.success("Ordem de serviço cadastrada com sucesso!");
    navigate("/ordens");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate("/ordens")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cadastrar Ordem de Serviço</h1>
            <p className="text-muted-foreground mt-1">Preencha os dados da nova ordem</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Dados do Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Nome do Cliente / Empresa *</Label>
                  <Input
                    id="cliente"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    placeholder="Nome do cliente ou empresa"
                    className={errors.cliente ? "border-destructive" : ""}
                  />
                  {errors.cliente && (
                    <p className="text-sm text-destructive">{errors.cliente}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contato">Contato (opcional)</Label>
                  <Input
                    id="contato"
                    value={contato}
                    onChange={(e) => setContato(e.target.value)}
                    placeholder="Telefone ou WhatsApp"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Endereço completo"
                    className={errors.endereco ? "border-destructive" : ""}
                  />
                  {errors.endereco && (
                    <p className="text-sm text-destructive">{errors.endereco}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={errors.data ? "border-destructive" : ""}
                  />
                  {errors.data && (
                    <p className="text-sm text-destructive">{errors.data}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Serviços</h2>
                <Button type="button" variant="outline" size="sm" onClick={addServicoItem}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Serviço
                </Button>
              </div>
              {errors.servicos && (
                <p className="text-sm text-destructive mb-4">{errors.servicos}</p>
              )}
              <div className="space-y-4">
                {servicosItems.map((servico, index) => (
                  <div
                    key={servico.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/30 rounded-lg items-end"
                  >
                    <div className="md:col-span-4 space-y-2">
                      <Label>Tipo de Serviço</Label>
                      <Select
                        value={servico.tipo}
                        onValueChange={(value) => updateServicoItem(servico.id, "tipo", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_SERVICO.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {servico.tipo === "Outro" && (
                      <div className="md:col-span-3 space-y-2">
                        <Label>Especificar</Label>
                        <Input
                          value={servico.tipoOutro || ""}
                          onChange={(e) => updateServicoItem(servico.id, "tipoOutro", e.target.value)}
                          placeholder="Descreva o serviço"
                        />
                      </div>
                    )}
                    <div className={`${servico.tipo === "Outro" ? "md:col-span-2" : "md:col-span-3"} space-y-2`}>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min={1}
                        value={servico.quantidade}
                        onChange={(e) => updateServicoItem(servico.id, "quantidade", parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className={`${servico.tipo === "Outro" ? "md:col-span-2" : "md:col-span-3"} space-y-2`}>
                      <Label>Valor Unitário (R$)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={servico.valorUnitario}
                        onChange={(e) => updateServicoItem(servico.id, "valorUnitario", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <p className="text-sm text-primary font-semibold md:hidden">
                        Subtotal: {formatCurrency(servico.quantidade * servico.valorUnitario)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeServicoItem(servico.id)}
                        disabled={servicosItems.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="hidden md:block md:col-span-12 text-right">
                      <span className="text-sm text-muted-foreground">Subtotal: </span>
                      <span className="text-primary font-semibold">
                        {formatCurrency(servico.quantidade * servico.valorUnitario)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Technicians */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Técnicos Responsáveis</h2>
                <Button type="button" variant="outline" size="sm" onClick={addTecnicoServico}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Técnico
                </Button>
              </div>
              {errors.tecnicos && (
                <p className="text-sm text-destructive mb-4">{errors.tecnicos}</p>
              )}
              <div className="space-y-4">
                {tecnicosServico.map((tecServ) => (
                  <div
                    key={tecServ.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted/30 rounded-lg items-end"
                  >
                    <div className="md:col-span-6 space-y-2">
                      <Label>Técnico</Label>
                      <Select
                        value={tecServ.tecnicoId}
                        onValueChange={(value) => updateTecnicoServico(tecServ.id, "tecnicoId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o técnico" />
                        </SelectTrigger>
                        <SelectContent>
                          {tecnicosAtivos.map((tec) => (
                            <SelectItem key={tec.id} value={tec.id}>
                              {tec.nome} ({tec.tipo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-4 space-y-2">
                      <Label>Valor Pago ao Técnico (R$)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={tecServ.valorPago}
                        onChange={(e) => updateTecnicoServico(tecServ.id, "valorPago", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTecnicoServico(tecServ.id)}
                        disabled={tecnicosServico.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Payment & Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass" className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pagamento e Resumo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min={0}
                    step={0.01}
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <div className="h-10 px-4 flex items-center rounded-md bg-primary/10 border border-primary/30">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(valorTotal)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o serviço..."
                  rows={3}
                />
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Button type="button" variant="outline" onClick={() => navigate("/ordens")}>
              Cancelar
            </Button>
            <Button type="submit" size="lg">
              <Save className="w-5 h-5 mr-2" />
              Salvar Ordem
            </Button>
          </motion.div>
        </form>
      </div>
    </MainLayout>
  );
}
