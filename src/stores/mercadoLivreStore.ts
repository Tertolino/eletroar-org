import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConfiguracoesGlobaisML {
  taxaPercentual: number; // %
  taxaFixa: number; // R$
  custoEnvio: number; // R$
  custoEmbalagem: number; // R$
  margemMinima: number; // %
  margemIdeal: number; // %
}

export interface ProdutoML {
  id: string;
  nome: string;
  custoProduto: number;
  observacoes?: string;
  usarConfigGlobais: boolean;
  // Configurações personalizadas (usadas se usarConfigGlobais = false)
  taxaPercentual?: number;
  taxaFixa?: number;
  custoEnvio?: number;
  custoEmbalagem?: number;
  margemMinima?: number;
  margemIdeal?: number;
  createdAt: string;
}

export interface BreakEvenConfig {
  custoFixoMensal: number;
  lucroDesejado: number;
}

interface MercadoLivreState {
  configuracoesGlobais: ConfiguracoesGlobaisML;
  produtos: ProdutoML[];
  breakEvenConfig: BreakEvenConfig;
  
  // Actions
  setConfiguracoesGlobais: (config: Partial<ConfiguracoesGlobaisML>) => void;
  addProduto: (produto: Omit<ProdutoML, "id" | "createdAt">) => void;
  updateProduto: (id: string, produto: Partial<ProdutoML>) => void;
  removeProduto: (id: string) => void;
  setBreakEvenConfig: (config: Partial<BreakEvenConfig>) => void;
}

// Funções de cálculo
export function calcularPrecoProduto(
  produto: ProdutoML,
  configGlobais: ConfiguracoesGlobaisML
) {
  const taxaPercentual = produto.usarConfigGlobais
    ? configGlobais.taxaPercentual
    : produto.taxaPercentual ?? configGlobais.taxaPercentual;
  const taxaFixa = produto.usarConfigGlobais
    ? configGlobais.taxaFixa
    : produto.taxaFixa ?? configGlobais.taxaFixa;
  const custoEnvio = produto.usarConfigGlobais
    ? configGlobais.custoEnvio
    : produto.custoEnvio ?? configGlobais.custoEnvio;
  const custoEmbalagem = produto.usarConfigGlobais
    ? configGlobais.custoEmbalagem
    : produto.custoEmbalagem ?? configGlobais.custoEmbalagem;
  const margemMinima = produto.usarConfigGlobais
    ? configGlobais.margemMinima
    : produto.margemMinima ?? configGlobais.margemMinima;
  const margemIdeal = produto.usarConfigGlobais
    ? configGlobais.margemIdeal
    : produto.margemIdeal ?? configGlobais.margemIdeal;

  const custoTotal = produto.custoProduto + custoEnvio + custoEmbalagem;
  
  // preco_equilibrio = (custo_total + taxa_fixa) / (1 - taxa_percentual)
  const taxaDecimal = taxaPercentual / 100;
  const precoEquilibrio = (custoTotal + taxaFixa) / (1 - taxaDecimal);
  
  // preco_com_margem = (custo_total + taxa_fixa) / (1 - taxa_percentual - margem)
  const margemMinimaDecimal = margemMinima / 100;
  const margemIdealDecimal = margemIdeal / 100;
  
  const precoMinimo = (custoTotal + taxaFixa) / (1 - taxaDecimal - margemMinimaDecimal);
  const precoIdeal = (custoTotal + taxaFixa) / (1 - taxaDecimal - margemIdealDecimal);
  
  // Lucro estimado com preço ideal
  const lucroEstimado = precoIdeal - custoTotal - taxaFixa - (precoIdeal * taxaDecimal);
  
  // Margem real
  const margemReal = precoIdeal > 0 ? (lucroEstimado / precoIdeal) * 100 : 0;

  return {
    custoTotal,
    precoEquilibrio,
    precoMinimo,
    precoIdeal,
    lucroEstimado,
    margemReal,
    taxaPercentual,
    taxaFixa,
    custoEnvio,
    custoEmbalagem,
    margemMinima,
    margemIdeal,
  };
}

export const useMercadoLivreStore = create<MercadoLivreState>()(
  persist(
    (set) => ({
      configuracoesGlobais: {
        taxaPercentual: 16,
        taxaFixa: 6,
        custoEnvio: 15,
        custoEmbalagem: 3,
        margemMinima: 10,
        margemIdeal: 25,
      },
      produtos: [],
      breakEvenConfig: {
        custoFixoMensal: 0,
        lucroDesejado: 0,
      },

      setConfiguracoesGlobais: (config) =>
        set((state) => ({
          configuracoesGlobais: { ...state.configuracoesGlobais, ...config },
        })),

      addProduto: (produto) =>
        set((state) => ({
          produtos: [
            ...state.produtos,
            {
              ...produto,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateProduto: (id, produto) =>
        set((state) => ({
          produtos: state.produtos.map((p) =>
            p.id === id ? { ...p, ...produto } : p
          ),
        })),

      removeProduto: (id) =>
        set((state) => ({
          produtos: state.produtos.filter((p) => p.id !== id),
        })),

      setBreakEvenConfig: (config) =>
        set((state) => ({
          breakEvenConfig: { ...state.breakEvenConfig, ...config },
        })),
    }),
    {
      name: "mercado-livre-storage",
    }
  )
);
