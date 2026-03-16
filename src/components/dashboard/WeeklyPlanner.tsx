import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useServicosWeekly,
  useTecnicosDB,
  useCreateServico,
  useUpdateServico,
  type ServicoDB,
} from "@/hooks/useServicosDB";

// ── Color mapping by service type (tokens do design system) ──
const SERVICE_TYPE_BORDER_CLASS: Record<string, string> = {
  "Instalação": "border-l-primary",
  "Manutenção": "border-l-secondary",
  "Manutenção Técnica": "border-l-secondary",
  "Reparo": "border-l-accent",
  "Higienização": "border-l-accent",
  "Reparo/Higienização": "border-l-accent",
  "Urgente": "border-l-destructive",
};

const BACKLOG_TAGS: Record<string, { label: string; className: string }> = {
  adiado: { label: "Ag. cliente", className: "bg-accent/20 text-accent" },
  pendente: { label: "Sem prioridade", className: "bg-muted text-muted-foreground" },
};

const TIPOS_SERVICO = ["Instalação", "Higienização", "Carga de Gás", "Manutenção Técnica", "Outro"];
const FORMAS_PAGAMENTO = ["Pix", "Cartão", "Dinheiro", "Transferência"];
const PRECOS_BASE: Record<string, number> = {
  "Instalação": 400,
  "Higienização": 180,
  "Carga de Gás": 320,
  "Manutenção Técnica": 350,
  "Outro": 0,
};

interface LocalServicoItem {
  id: string;
  tipo: string;
  tipoOutro?: string;
  quantidade: number;
  valorUnitario: number;
}

interface LocalTecnicoServico {
  id: string;
  tecnicoId: string;
  tecnicoNome: string;
  valorPago: number;
}

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_NAMES = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const MAX_DAILY_OS = 5;

export function WeeklyPlanner() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekStart = formatDateKey(weekDates[0]);
  const weekEnd = formatDateKey(weekDates[4]);

  const { data, isLoading } = useServicosWeekly(weekStart, weekEnd);
  const { data: tecnicosAtivos = [] } = useTecnicosDB();
  const createServico = useCreateServico();
  const updateServico = useUpdateServico();

  // Backlog schedule modal
  const [scheduleModal, setScheduleModal] = useState<ServicoDB | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTecnico, setSelectedTecnico] = useState("");

  // New OS modal
  const [newOsModal, setNewOsModal] = useState(false);
  const [newOsDate, setNewOsDate] = useState("");

  // New OS form state
  const [cliente, setCliente] = useState("");
  const [endereco, setEndereco] = useState("");
  const [contato, setContato] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [servicosItems, setServicosItems] = useState<LocalServicoItem[]>([
    { id: "1", tipo: "", quantidade: 1, valorUnitario: 0 },
  ]);
  const [tecnicosServico, setTecnicosServico] = useState<LocalTecnicoServico[]>([
    { id: "1", tecnicoId: "", tecnicoNome: "", valorPago: 0 },
  ]);

  const weekLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${fmt(weekDates[0])} – ${fmt(weekDates[4])}`;
  }, [weekDates]);

  const scheduled = data?.scheduled || [];
  const backlog = data?.backlog || [];

  // Map servicos to calendar days
  const scheduledByDay = useMemo(() => {
    const map: Record<string, ServicoDB[]> = {};
    weekDates.forEach((d) => (map[formatDateKey(d)] = []));
    scheduled.forEach((s) => {
      if (s.data && map[s.data]) {
        map[s.data].push(s);
      }
    });
    return map;
  }, [scheduled, weekDates]);

  // ── Backlog schedule handler ──
  const handleSchedule = useCallback(() => {
    if (!scheduleModal || !selectedDate) return;
    const updates: Record<string, unknown> = { data: selectedDate };
    updateServico.mutate(
      { id: scheduleModal.id, updates },
      {
        onSuccess: () => {
          // If a tecnico was selected and the OS has no tecnico yet, add one
          if (selectedTecnico && scheduleModal.tecnico_servico.length === 0) {
            const tec = tecnicosAtivos.find((t) => t.id === selectedTecnico);
            if (tec) {
              import("@/integrations/supabase/client").then(({ supabase }) => {
                supabase.from("tecnico_servico").insert({
                  servico_id: scheduleModal.id,
                  tecnico_id: tec.id,
                  tecnico_nome: tec.nome,
                  valor_pago: 0,
                  pago: false,
                });
              });
            }
          }
          setScheduleModal(null);
          setSelectedDate("");
          setSelectedTecnico("");
          toast.success("OS agendada com sucesso!");
        },
        onError: () => toast.error("Erro ao agendar OS"),
      }
    );
  }, [scheduleModal, selectedDate, selectedTecnico, updateServico, tecnicosAtivos]);

  // ── New OS form helpers ──
  const valorBruto = useMemo(
    () => servicosItems.reduce((acc, s) => acc + s.quantidade * s.valorUnitario, 0),
    [servicosItems]
  );
  const valorTotal = Math.max(0, valorBruto - desconto);

  const resetNewOsForm = () => {
    setCliente("");
    setEndereco("");
    setContato("");
    setDesconto(0);
    setFormaPagamento("");
    setObservacoes("");
    setServicosItems([{ id: "1", tipo: "", quantidade: 1, valorUnitario: 0 }]);
    setTecnicosServico([{ id: "1", tecnicoId: "", tecnicoNome: "", valorPago: 0 }]);
  };

  const openNewOsModal = (dateKey: string) => {
    resetNewOsForm();
    setNewOsDate(dateKey);
    setNewOsModal(true);
  };

  const addServicoItem = () => {
    setServicosItems([...servicosItems, { id: Date.now().toString(), tipo: "", quantidade: 1, valorUnitario: 0 }]);
  };
  const removeServicoItem = (id: string) => {
    if (servicosItems.length > 1) setServicosItems(servicosItems.filter((s) => s.id !== id));
  };
  const updateServicoItem = (id: string, field: keyof LocalServicoItem, value: string | number) => {
    setServicosItems(
      servicosItems.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === "tipo" && typeof value === "string" && PRECOS_BASE[value]) {
          updated.valorUnitario = PRECOS_BASE[value];
        }
        return updated;
      })
    );
  };
  const addTecnicoServico = () => {
    setTecnicosServico([
      ...tecnicosServico,
      { id: Date.now().toString(), tecnicoId: "", tecnicoNome: "", valorPago: 0 },
    ]);
  };
  const removeTecnicoServico = (id: string) => {
    if (tecnicosServico.length > 1) setTecnicosServico(tecnicosServico.filter((t) => t.id !== id));
  };
  const updateTecnicoServico = (id: string, field: keyof LocalTecnicoServico, value: string | number) => {
    setTecnicosServico(
      tecnicosServico.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        if (field === "tecnicoId" && typeof value === "string") {
          const tec = tecnicosAtivos.find((tc) => tc.id === value);
          if (tec) updated.tecnicoNome = tec.nome;
        }
        return updated;
      })
    );
  };

  const handleNewOsSubmit = () => {
    const filteredServicos = servicosItems.filter((s) => s.tipo);
    const filteredTecnicos = tecnicosServico.filter((t) => t.tecnicoId);

    createServico.mutate(
      {
        cliente: cliente.trim(),
        endereco: endereco.trim(),
        contato: contato.trim(),
        data: newOsDate,
        valor_total: valorTotal,
        desconto,
        forma_pagamento: formaPagamento || "Pix",
        observacoes: observacoes.trim(),
        servicos: filteredServicos.map((s) => ({
          tipo: s.tipo,
          tipo_outro: s.tipoOutro,
          quantidade: s.quantidade,
          valor_unitario: s.valorUnitario,
        })),
        tecnicos: filteredTecnicos.map((t) => ({
          tecnico_id: t.tecnicoId,
          tecnico_nome: t.tecnicoNome,
          valor_pago: t.valorPago,
        })),
      },
      {
        onSuccess: () => {
          toast.success("OS cadastrada com sucesso!");
          setNewOsModal(false);
          resetNewOsForm();
        },
        onError: () => toast.error("Erro ao cadastrar OS. Verifique se está autenticado."),
      }
    );
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  const getServiceColor = (s: ServicoDB) => {
    const tipo = s.servico_items?.[0]?.tipo || "";
    return SERVICE_TYPE_COLORS[tipo] || "hsl(var(--muted-foreground))";
  };

  const dateOptions = useMemo(
    () =>
      weekDates.map((d) => ({
        value: formatDateKey(d),
        label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      })),
    [weekDates]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="stat-card p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">Planejamento Semanal</h3>
            <Badge className="bg-primary/20 text-primary border-0">{backlog.length} no backlog</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[160px] text-center">{weekLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-4">
          {/* Calendar */}
          <div className="flex-1 grid grid-cols-5 gap-2">
            {isLoading ? (
              <div className="col-span-5 flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              weekDates.map((date, i) => {
                const key = formatDateKey(date);
                const dayServicos = scheduledByDay[key] || [];
                const load = Math.min((dayServicos.length / MAX_DAILY_OS) * 100, 100);
                const isToday = formatDateKey(new Date()) === key;

                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 flex flex-col gap-2 min-h-[180px] ${
                      isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card/50"
                    }`}
                  >
                    <div className="text-center mb-1">
                      <p className="text-xs font-medium text-muted-foreground">{DAY_NAMES[i]}</p>
                      <p className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                        {date.getDate()}
                      </p>
                    </div>

                    <div className="flex-1 space-y-1.5">
                      {dayServicos.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-md bg-muted/40 p-1.5 text-xs border-l-2 cursor-default"
                          style={{ borderLeftColor: getServiceColor(s) }}
                        >
                          <p className="font-medium text-foreground truncate">OS #{s.id.slice(0, 6)}</p>
                          <p className="text-muted-foreground truncate">{s.cliente || "Sem cliente"}</p>
                          <p className="text-muted-foreground truncate">
                            {s.tecnico_servico?.[0]?.tecnico_nome?.split(" ")[0] || "—"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* "+ OS" button */}
                    <button
                      className="w-full flex items-center justify-center rounded-md border border-dashed border-border/50 text-muted-foreground/50 hover:text-primary hover:border-primary/30 transition-colors text-xs py-1.5"
                      onClick={() => openNewOsModal(key)}
                    >
                      <Plus className="h-3 w-3 mr-1" /> OS
                    </button>

                    <Progress value={load} className="h-1" />
                  </div>
                );
              })
            )}
          </div>

          {/* Backlog panel */}
          <div className="w-[220px] shrink-0 rounded-lg border border-border bg-card/50 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Backlog</span>
              <Badge className="bg-primary/20 text-primary border-0 text-[10px] px-1.5">{backlog.length}</Badge>
            </div>
            <ScrollArea className="flex-1 -mr-2 pr-2">
              <div className="space-y-2">
                {isLoading && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoading && backlog.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">Todas as OSs estão agendadas</p>
                )}
                {backlog.map((s) => {
                  const tag = BACKLOG_TAGS[s.status] || BACKLOG_TAGS.pendente;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setScheduleModal(s);
                        setSelectedDate("");
                        setSelectedTecnico("");
                      }}
                      className="w-full text-left rounded-md bg-muted/30 hover:bg-muted/50 p-2 transition-colors"
                    >
                      <p className="text-xs font-medium text-foreground truncate">OS #{s.id.slice(0, 6)}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{s.cliente || "Sem cliente"}</p>
                      <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${tag.className}`}>
                        {tag.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* ── Backlog Schedule Modal ── */}
      <Dialog open={!!scheduleModal} onOpenChange={(open) => !open && setScheduleModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar OS #{scheduleModal?.id.slice(0, 6)}</DialogTitle>
            <DialogDescription>Selecione o dia e o técnico para agendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Cliente</Label>
              <p className="text-sm text-muted-foreground">{scheduleModal?.cliente || "Sem cliente"}</p>
            </div>
            <div className="space-y-2">
              <Label>Dia da Semana</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger><SelectValue placeholder="Selecione o dia" /></SelectTrigger>
                <SelectContent>
                  {dateOptions.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select value={selectedTecnico} onValueChange={setSelectedTecnico}>
                <SelectTrigger><SelectValue placeholder="Selecione o técnico" /></SelectTrigger>
                <SelectContent>
                  {tecnicosAtivos.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModal(null)}>Cancelar</Button>
            <Button onClick={handleSchedule} disabled={!selectedDate || updateServico.isPending}>
              {updateServico.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New OS Creation Modal ── */}
      <Dialog open={newOsModal} onOpenChange={(open) => { if (!open) { setNewOsModal(false); resetNewOsForm(); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova OS</DialogTitle>
            <DialogDescription>
              Data pré-selecionada: {newOsDate ? new Date(newOsDate + "T12:00:00").toLocaleDateString("pt-BR") : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Client data */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Dados do Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Cliente</Label>
                  <Input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nome do cliente" />
                </div>
                <div className="space-y-1">
                  <Label>Contato</Label>
                  <Input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Telefone" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label>Endereço</Label>
                  <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço completo" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Serviços</h4>
                <Button type="button" variant="outline" size="sm" onClick={addServicoItem}>
                  <Plus className="w-3 h-3 mr-1" /> Serviço
                </Button>
              </div>
              <div className="space-y-3">
                {servicosItems.map((servico) => (
                  <div key={servico.id} className="grid grid-cols-12 gap-2 p-3 bg-muted/30 rounded-lg items-end">
                    <div className="col-span-5 space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={servico.tipo} onValueChange={(v) => updateServicoItem(servico.id, "tipo", v)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Tipo" /></SelectTrigger>
                        <SelectContent>
                          {TIPOS_SERVICO.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input className="h-9" type="number" min={1} value={servico.quantidade}
                        onChange={(e) => updateServicoItem(servico.id, "quantidade", parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input className="h-9" type="number" min={0} step={0.01} value={servico.valorUnitario}
                        onChange={(e) => updateServicoItem(servico.id, "valorUnitario", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive"
                        onClick={() => removeServicoItem(servico.id)} disabled={servicosItems.length === 1}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technicians */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Técnicos</h4>
                <Button type="button" variant="outline" size="sm" onClick={addTecnicoServico}>
                  <Plus className="w-3 h-3 mr-1" /> Técnico
                </Button>
              </div>
              <div className="space-y-3">
                {tecnicosServico.map((ts) => (
                  <div key={ts.id} className="grid grid-cols-12 gap-2 p-3 bg-muted/30 rounded-lg items-end">
                    <div className="col-span-7 space-y-1">
                      <Label className="text-xs">Técnico</Label>
                      <Select value={ts.tecnicoId} onValueChange={(v) => updateTecnicoServico(ts.id, "tecnicoId", v)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {tecnicosAtivos.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome} ({t.tipo})</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input className="h-9" type="number" min={0} step={0.01} value={ts.valorPago}
                        onChange={(e) => updateTecnicoServico(ts.id, "valorPago", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive"
                        onClick={() => removeTecnicoServico(ts.id)} disabled={tecnicosServico.length === 1}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & summary */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Pagamento</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Forma</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Desconto (R$)</Label>
                  <Input className="h-9" type="number" min={0} step={0.01} value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total</Label>
                  <div className="h-9 px-3 flex items-center rounded-md bg-primary/10 border border-primary/30">
                    <span className="text-sm font-bold text-primary">{formatCurrency(valorTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Label className="text-xs">Observações</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..." rows={2} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewOsModal(false); resetNewOsForm(); }}>Cancelar</Button>
            <Button onClick={handleNewOsSubmit} disabled={createServico.isPending}>
              {createServico.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              Salvar OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
