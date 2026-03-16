import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServicoItemDB {
  id: string;
  servico_id: string;
  tipo: string | null;
  tipo_outro: string | null;
  quantidade: number;
  valor_unitario: number;
}

export interface TecnicoServicoDB {
  id: string;
  servico_id: string;
  tecnico_id: string | null;
  tecnico_nome: string | null;
  valor_pago: number;
  pago: boolean;
}

export interface ServicoDB {
  id: string;
  user_id: string;
  cliente: string | null;
  endereco: string | null;
  contato: string | null;
  data: string | null;
  valor_total: number;
  desconto: number;
  forma_pagamento: string | null;
  status: string;
  pago: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  servico_items: ServicoItemDB[];
  tecnico_servico: TecnicoServicoDB[];
}

export interface TecnicoDB {
  id: string;
  user_id: string;
  nome: string;
  contato: string | null;
  tipo: string;
  ativo: boolean;
}

export function useServicosWeekly(weekStart: string, weekEnd: string) {
  return useQuery({
    queryKey: ["servicos-weekly", weekStart, weekEnd],
    queryFn: async () => {
      // Fetch servicos for the week range
      const { data: scheduled, error: e1 } = await supabase
        .from("servicos")
        .select("*, servico_items(*), tecnico_servico(*)")
        .gte("data", weekStart)
        .lte("data", weekEnd)
        .neq("status", "cancelado");

      if (e1) throw e1;

      // Fetch backlog (no date, not cancelled/concluded)
      const { data: backlog, error: e2 } = await supabase
        .from("servicos")
        .select("*, servico_items(*), tecnico_servico(*)")
        .is("data", null)
        .not("status", "in", '("cancelado","concluido")');

      if (e2) throw e2;

      // Also fetch backlog with empty string dates
      const { data: backlogEmpty, error: e3 } = await supabase
        .from("servicos")
        .select("*, servico_items(*), tecnico_servico(*)")
        .eq("data", "")
        .not("status", "in", '("cancelado","concluido")');

      // Merge backlog results (ignore error on empty string query since data column is date type)
      const allBacklog = [...(backlog || []), ...(backlogEmpty || [])];

      return {
        scheduled: (scheduled || []) as ServicoDB[],
        backlog: allBacklog as ServicoDB[],
      };
    },
  });
}

export function useTecnicosDB() {
  return useQuery({
    queryKey: ["tecnicos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tecnicos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as TecnicoDB[];
    },
  });
}

export function useCreateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      cliente: string;
      endereco: string;
      contato: string;
      data: string;
      valor_total: number;
      desconto: number;
      forma_pagamento: string;
      observacoes: string;
      servicos: { tipo: string; tipo_outro?: string; quantidade: number; valor_unitario: number }[];
      tecnicos: { tecnico_id: string; tecnico_nome: string; valor_pago: number }[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Insert servico
      const { data: servico, error: e1 } = await supabase
        .from("servicos")
        .insert({
          user_id: user.id,
          cliente: input.cliente,
          endereco: input.endereco,
          contato: input.contato,
          data: input.data || null,
          valor_total: input.valor_total,
          desconto: input.desconto,
          forma_pagamento: input.forma_pagamento,
          observacoes: input.observacoes,
          status: "pendente",
          pago: false,
        })
        .select()
        .single();

      if (e1) throw e1;

      // Insert servico items
      if (input.servicos.length > 0) {
        const { error: e2 } = await supabase.from("servico_items").insert(
          input.servicos.map((s) => ({
            servico_id: servico.id,
            tipo: s.tipo,
            tipo_outro: s.tipo_outro || "",
            quantidade: s.quantidade,
            valor_unitario: s.valor_unitario,
          }))
        );
        if (e2) throw e2;
      }

      // Insert tecnico_servico
      if (input.tecnicos.length > 0) {
        const { error: e3 } = await supabase.from("tecnico_servico").insert(
          input.tecnicos.map((t) => ({
            servico_id: servico.id,
            tecnico_id: t.tecnico_id || null,
            tecnico_nome: t.tecnico_nome,
            valor_pago: t.valor_pago,
            pago: false,
          }))
        );
        if (e3) throw e3;
      }

      return servico;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos-weekly"] });
    },
  });
}

export function useUpdateServico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from("servicos")
        .update(input.updates)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicos-weekly"] });
    },
  });
}
