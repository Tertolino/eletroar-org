import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ChevronDown, Calendar, User, MapPin, Phone, Edit, Trash2, Check, X } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useServicosStore, Servico } from "@/stores/servicosStore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors = {
  pendente: "status-pending",
  concluido: "status-success",
  cancelado: "status-error",
  adiado: "bg-secondary/20 text-secondary",
};

const statusLabels = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
  adiado: "Adiado",
};

interface OrdensServicoListProps {
  showOnlyConcluidos?: boolean;
}

export default function OrdensServico({ showOnlyConcluidos = false }: OrdensServicoListProps) {
  const navigate = useNavigate();
  const { servicos, updateServico, deleteServico } = useServicosStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicoToDelete, setServicoToDelete] = useState<string | null>(null);

  // Filter based on page type
  const baseServicos = showOnlyConcluidos
    ? servicos.filter((s) => s.status === "concluido")
    : servicos.filter((s) => s.status !== "concluido");

  const filteredServicos = baseServicos.filter(
    (s) =>
      s.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tecnicos.some((t) => t.tecnicoNome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.servicos.some((serv) => serv.tipo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleEdit = (e: React.MouseEvent, servico: Servico) => {
    e.stopPropagation();
    navigate(`/editar-ordem/${servico.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setServicoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (servicoToDelete) {
      deleteServico(servicoToDelete);
      toast.success("Ordem de serviço excluída com sucesso!");
      setServicoToDelete(null);
      setDeleteDialogOpen(false);
      setExpandedId(null);
    }
  };

  const handleTogglePago = (e: React.MouseEvent, servico: Servico) => {
    e.stopPropagation();
    updateServico(servico.id, { pago: !servico.pago });
    toast.success(servico.pago ? "Marcado como não pago" : "Marcado como pago");
  };

  const handleToggleTecnicoPago = (e: React.MouseEvent, servico: Servico, tecnicoId: string) => {
    e.stopPropagation();
    const updatedTecnicos = servico.tecnicos.map((t) =>
      t.id === tecnicoId ? { ...t, pago: !t.pago } : t
    );
    updateServico(servico.id, { tecnicos: updatedTecnicos });
    toast.success("Status de pagamento do técnico atualizado");
  };

  const handleToggleStatus = (e: React.MouseEvent, servico: Servico, newStatus: Servico["status"]) => {
    e.stopPropagation();
    updateServico(servico.id, { status: newStatus });
    toast.success(
      newStatus === "concluido"
        ? "Ordem marcada como concluída e movida para o histórico"
        : `Status alterado para ${statusLabels[newStatus]}`
    );
  };

  const getTotalTecnicoPago = (servico: Servico) => {
    return servico.tecnicos.reduce((acc, t) => acc + t.valorPago, 0);
  };

  const allTecnicosPaid = (servico: Servico) => {
    return servico.tecnicos.every((t) => t.pago);
  };

  const getTecnicosDisplay = (servico: Servico) => {
    return servico.tecnicos.map((t) => t.tecnicoNome).join(", ");
  };

  const getServicosDisplay = (servico: Servico) => {
    return servico.servicos.map((s) => s.tipo).join(", ");
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
            <h1 className="text-3xl font-bold text-foreground">
              {showOnlyConcluidos ? "Histórico de Serviços" : "Ordens de Serviço"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {showOnlyConcluidos
                ? "Visualize os serviços concluídos"
                : "Gerencie as ordens de serviço pendentes"}
            </p>
          </div>
          {!showOnlyConcluidos && (
            <Button size="lg" onClick={() => navigate("/cadastrar-ordem")}>
              <Plus className="w-5 h-5" />
              Nova Ordem
            </Button>
          )}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, técnico ou tipo de serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </motion.div>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServicos.map((servico, index) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card
                variant="glass"
                className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setExpandedId(expandedId === servico.id ? null : servico.id)}
              >
                {/* Compact View */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-foreground text-lg">{servico.cliente}</h3>
                        <span className={`status-badge ${statusColors[servico.status]}`}>
                          {statusLabels[servico.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(servico.data)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getTecnicosDisplay(servico)}
                        </span>
                        <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                          {getServicosDisplay(servico)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(servico.valorTotal)}
                        </p>
                        <div className="flex gap-2 mt-1 flex-wrap justify-end">
                          <span
                            className={`status-badge text-xs ${
                              servico.pago ? "status-success" : "status-pending"
                            }`}
                          >
                            {servico.pago ? "Pago" : "Não Pago"}
                          </span>
                          <span
                            className={`status-badge text-xs ${
                              allTecnicosPaid(servico) ? "status-success" : "status-pending"
                            }`}
                          >
                            {allTecnicosPaid(servico) ? "Técnico Pago" : "Técnico Não Pago"}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedId === servico.id ? 180 : 0 }}
                        className="text-muted-foreground"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {expandedId === servico.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-border space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Endereço
                            </p>
                            <p className="text-foreground">{servico.endereco}</p>
                          </div>
                          {servico.contato && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Contato
                              </p>
                              <p className="text-foreground">{servico.contato}</p>
                            </div>
                          )}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                            <p className="text-foreground">{servico.formaPagamento}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Técnicos</p>
                            <p className="text-secondary font-semibold">
                              {formatCurrency(getTotalTecnicoPago(servico))}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Lucro</p>
                            <p className="text-success font-semibold">
                              {formatCurrency(servico.valorTotal - getTotalTecnicoPago(servico))}
                            </p>
                          </div>
                          {servico.desconto > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Desconto</p>
                              <p className="text-warning font-semibold">
                                {formatCurrency(servico.desconto)}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Serviços detalhados */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Serviços</p>
                          <div className="flex flex-wrap gap-2">
                            {servico.servicos.map((s) => (
                              <span
                                key={s.id}
                                className="bg-muted px-3 py-1 rounded-lg text-sm text-foreground"
                              >
                                {s.quantidade}x {s.tipo} - {formatCurrency(s.valorUnitario * s.quantidade)}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Técnicos detalhados */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Técnicos</p>
                          <div className="flex flex-wrap gap-2">
                            {servico.tecnicos.map((t) => (
                              <button
                                key={t.id}
                                onClick={(e) => handleToggleTecnicoPago(e, servico, t.id)}
                                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                                  t.pago
                                    ? "bg-success/20 text-success hover:bg-success/30"
                                    : "bg-warning/20 text-warning hover:bg-warning/30"
                                }`}
                              >
                                {t.tecnicoNome}: {formatCurrency(t.valorPago)}
                                {t.pago ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {servico.observacoes && (
                          <div className="space-y-1 pt-2">
                            <p className="text-sm text-muted-foreground">Observações</p>
                            <p className="text-foreground bg-muted/30 p-3 rounded-lg">
                              {servico.observacoes}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEdit(e, servico)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant={servico.pago ? "outline" : "success"}
                            size="sm"
                            onClick={(e) => handleTogglePago(e, servico)}
                          >
                            {servico.pago ? "Desmarcar Pago" : "Marcar como Pago"}
                          </Button>
                          {!showOnlyConcluidos && servico.status !== "concluido" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={(e) => handleToggleStatus(e, servico, "concluido")}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                          {showOnlyConcluidos && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleToggleStatus(e, servico, "pendente")}
                            >
                              Reabrir
                            </Button>
                          )}
                          {!showOnlyConcluidos && servico.status === "pendente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleToggleStatus(e, servico, "adiado")}
                            >
                              Adiar
                            </Button>
                          )}
                          {!showOnlyConcluidos && servico.status !== "cancelado" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleToggleStatus(e, servico, "cancelado")}
                            >
                              Cancelar
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, servico.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredServicos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              {showOnlyConcluidos
                ? "Nenhum serviço concluído encontrado."
                : "Nenhuma ordem de serviço pendente encontrada."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
