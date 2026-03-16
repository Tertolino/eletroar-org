import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Phone, User, Briefcase, MoreVertical, Edit, Trash2, FileText, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useServicosStore, Tecnico } from "@/stores/servicosStore";
import { toast } from "sonner";

export default function Tecnicos() {
  const { tecnicos, servicos, addTecnico, updateTecnico, deleteTecnico } = useServicosStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Tecnico | null>(null);
  const [tecnicoToDelete, setTecnicoToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    contato: "",
    tipo: "fixo" as "fixo" | "terceirizado",
    ativo: true,
  });
  const [formErrors, setFormErrors] = useState<{ nome?: string; contato?: string }>({});

  const filteredTecnicos = tecnicos.filter((t) =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate technician stats from services
  const getTecnicoStats = (tecnicoId: string) => {
    let totalServicos = 0;
    let totalRecebido = 0;

    servicos.forEach((servico) => {
      servico.tecnicos.forEach((t) => {
        if (t.tecnicoId === tecnicoId) {
          totalServicos++;
          totalRecebido += t.valorPago;
        }
      });
    });

    return { totalServicos, totalRecebido };
  };

  // Open form for new technician
  const handleOpenNew = () => {
    setEditingTecnico(null);
    setFormData({ nome: "", contato: "", tipo: "fixo", ativo: true });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleOpenEdit = (tecnico: Tecnico) => {
    setEditingTecnico(tecnico);
    setFormData({
      nome: tecnico.nome,
      contato: tecnico.contato,
      tipo: tecnico.tipo,
      ativo: tecnico.ativo,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open delete confirmation
  const handleOpenDelete = (id: string) => {
    setTecnicoToDelete(id);
    setIsDeleteOpen(true);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: { nome?: string; contato?: string } = {};
    
    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    }
    
    if (!formData.contato.trim()) {
      errors.contato = "Contato é obrigatório";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save technician
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (editingTecnico) {
      updateTecnico(editingTecnico.id, formData);
      toast.success("Técnico atualizado com sucesso!");
    } else {
      addTecnico(formData);
      toast.success("Técnico cadastrado com sucesso!");
    }

    setIsFormOpen(false);
    setEditingTecnico(null);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (tecnicoToDelete) {
      deleteTecnico(tecnicoToDelete);
      toast.success("Técnico excluído com sucesso!");
      setTecnicoToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  // Toggle active status
  const handleToggleAtivo = (tecnico: Tecnico) => {
    updateTecnico(tecnico.id, { ativo: !tecnico.ativo });
    toast.success(tecnico.ativo ? "Técnico desativado" : "Técnico ativado");
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
            <h1 className="text-3xl font-bold text-foreground">Técnicos</h1>
            <p className="text-muted-foreground mt-1">Gerencie a equipe de técnicos</p>
          </div>
          <Button size="lg" onClick={handleOpenNew}>
            <Plus className="w-5 h-5" />
            Novo Técnico
          </Button>
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
            placeholder="Buscar técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
        </motion.div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTecnicos.map((tecnico, index) => {
            const stats = getTecnicoStats(tecnico.id);
            return (
              <motion.div
                key={tecnico.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card variant="elevated" className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-brand-orange-glow flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{tecnico.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleToggleAtivo(tecnico)}
                            className={`status-badge text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                              tecnico.ativo ? "status-success" : "status-error"
                            }`}
                          >
                            {tecnico.ativo ? "Ativo" : "Inativo"}
                          </button>
                          <span
                            className={`status-badge text-xs ${
                              tecnico.tipo === "fixo"
                                ? "bg-secondary/20 text-secondary"
                                : "bg-accent/20 text-accent"
                            }`}
                          >
                            {tecnico.tipo === "fixo" ? "Fixo" : "Terceirizado"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleOpenEdit(tecnico)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-destructive cursor-pointer"
                          onClick={() => handleOpenDelete(tecnico.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{tecnico.contato}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{stats.totalServicos} serviços realizados</span>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(stats.totalRecebido)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredTecnicos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">Nenhum técnico encontrado.</p>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTecnico ? "Editar Técnico" : "Novo Técnico"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo"
                className={formErrors.nome ? "border-destructive" : ""}
              />
              {formErrors.nome && (
                <p className="text-sm text-destructive">{formErrors.nome}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contato">Contato *</Label>
              <Input
                id="contato"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                placeholder="Telefone ou WhatsApp"
                className={formErrors.contato ? "border-destructive" : ""}
              />
              {formErrors.contato && (
                <p className="text-sm text-destructive">{formErrors.contato}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Vínculo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "fixo" | "terceirizado") => 
                  setFormData({ ...formData, tipo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo">Fixo</SelectItem>
                  <SelectItem value="terceirizado">Terceirizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="ativo" className="cursor-pointer">Técnico ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingTecnico ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este técnico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
