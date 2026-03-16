import { create } from 'zustand';

export interface ServicoItem {
  id: string;
  tipo: string;
  tipoOutro?: string;
  quantidade: number;
  valorUnitario: number;
}

export interface TecnicoServico {
  id: string;
  tecnicoId: string;
  tecnicoNome: string;
  valorPago: number;
  pago: boolean;
}

export interface Servico {
  id: string;
  cliente: string;
  endereco: string;
  contato: string;
  data: string;
  tecnicos: TecnicoServico[];
  servicos: ServicoItem[];
  valorTotal: number;
  desconto: number;
  formaPagamento: string;
  status: "pendente" | "concluido" | "cancelado" | "adiado";
  pago: boolean;
  observacoes: string;
  createdAt: string;
}

export interface Tecnico {
  id: string;
  nome: string;
  contato: string;
  tipo: "fixo" | "terceirizado";
  ativo: boolean;
}

interface ServicosState {
  servicos: Servico[];
  tecnicos: Tecnico[];
  addServico: (servico: Omit<Servico, 'id' | 'createdAt'>) => void;
  updateServico: (id: string, servico: Partial<Servico>) => void;
  deleteServico: (id: string) => void;
  addTecnico: (tecnico: Omit<Tecnico, 'id'>) => void;
  updateTecnico: (id: string, tecnico: Partial<Tecnico>) => void;
  deleteTecnico: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialTecnicos: Tecnico[] = [
  {
    id: "t1",
    nome: "Carlos Eduardo Silva",
    contato: "(11) 99999-1111",
    tipo: "fixo",
    ativo: true,
  },
  {
    id: "t2",
    nome: "Roberto Lima Santos",
    contato: "(11) 98888-2222",
    tipo: "terceirizado",
    ativo: true,
  },
  {
    id: "t3",
    nome: "Fernando Oliveira",
    contato: "(11) 97777-3333",
    tipo: "fixo",
    ativo: true,
  },
  {
    id: "t4",
    nome: "Marcos Pereira",
    contato: "(11) 96666-4444",
    tipo: "terceirizado",
    ativo: false,
  },
];

const initialServicos: Servico[] = [
  {
    id: "s1",
    cliente: "João Silva Ltda",
    endereco: "Rua das Flores, 123 - Centro",
    contato: "(11) 99999-1234",
    data: "2024-01-15",
    tecnicos: [
      { id: "ts1", tecnicoId: "t1", tecnicoNome: "Carlos Eduardo Silva", valorPago: 250, pago: true }
    ],
    servicos: [
      { id: "si1", tipo: "Instalação", quantidade: 2, valorUnitario: 425 }
    ],
    valorTotal: 850,
    desconto: 0,
    formaPagamento: "Pix",
    status: "concluido",
    pago: true,
    observacoes: "Cliente satisfeito. Instalação de 2 splits 12000 BTUs.",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "s2",
    cliente: "Maria Santos",
    endereco: "Av. Brasil, 456 - Jardim América",
    contato: "(11) 98888-5678",
    data: "2024-01-16",
    tecnicos: [
      { id: "ts2", tecnicoId: "t2", tecnicoNome: "Roberto Lima Santos", valorPago: 80, pago: false }
    ],
    servicos: [
      { id: "si2", tipo: "Higienização", quantidade: 1, valorUnitario: 180 }
    ],
    valorTotal: 180,
    desconto: 0,
    formaPagamento: "Cartão",
    status: "pendente",
    pago: false,
    observacoes: "",
    createdAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "s3",
    cliente: "Empresa ABC",
    endereco: "Rua Industrial, 789 - Distrito Industrial",
    contato: "(11) 97777-9012",
    data: "2024-01-17",
    tecnicos: [
      { id: "ts3", tecnicoId: "t1", tecnicoNome: "Carlos Eduardo Silva", valorPago: 150, pago: false }
    ],
    servicos: [
      { id: "si3", tipo: "Manutenção", quantidade: 1, valorUnitario: 450 }
    ],
    valorTotal: 450,
    desconto: 0,
    formaPagamento: "Transferência",
    status: "concluido",
    pago: true,
    observacoes: "Troca de capacitor e limpeza geral.",
    createdAt: "2024-01-17T10:00:00Z",
  },
  {
    id: "s4",
    cliente: "Clínica Bem Estar",
    endereco: "Rua da Saúde, 321 - Centro",
    contato: "(11) 96666-3456",
    data: "2024-01-18",
    tecnicos: [
      { id: "ts4", tecnicoId: "t2", tecnicoNome: "Roberto Lima Santos", valorPago: 100, pago: false }
    ],
    servicos: [
      { id: "si4", tipo: "Carga de Gás", quantidade: 1, valorUnitario: 320 }
    ],
    valorTotal: 320,
    desconto: 0,
    formaPagamento: "Dinheiro",
    status: "adiado",
    pago: false,
    observacoes: "Cliente solicitou adiamento para próxima semana.",
    createdAt: "2024-01-18T10:00:00Z",
  },
];

export const useServicosStore = create<ServicosState>((set) => ({
  servicos: initialServicos,
  tecnicos: initialTecnicos,
  
  addServico: (servico) =>
    set((state) => ({
      servicos: [
        ...state.servicos,
        { ...servico, id: generateId(), createdAt: new Date().toISOString() },
      ],
    })),
    
  updateServico: (id, updates) =>
    set((state) => ({
      servicos: state.servicos.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  deleteServico: (id) =>
    set((state) => ({
      servicos: state.servicos.filter((s) => s.id !== id),
    })),
    
  addTecnico: (tecnico) =>
    set((state) => ({
      tecnicos: [...state.tecnicos, { ...tecnico, id: generateId() }],
    })),
    
  updateTecnico: (id, updates) =>
    set((state) => ({
      tecnicos: state.tecnicos.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
    
  deleteTecnico: (id) =>
    set((state) => ({
      tecnicos: state.tecnicos.filter((t) => t.id !== id),
    })),
}));
