import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import OrdensServico from "./pages/OrdensServico";
import Historico from "./pages/Historico";
import Tecnicos from "./pages/Tecnicos";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import CadastrarOrdem from "./pages/CadastrarOrdem";
import EditarOrdem from "./pages/EditarOrdem";
import NotFound from "./pages/NotFound";

// Mercado Livre Pages
import ConfiguracoesML from "./pages/ml/ConfiguracoesML";
import CadastroProdutoML from "./pages/ml/CadastroProdutoML";
import ProdutosML from "./pages/ml/ProdutosML";
import BreakEvenML from "./pages/ml/BreakEvenML";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Climatização */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastrar-ordem" element={<CadastrarOrdem />} />
          <Route path="/editar-ordem/:id" element={<EditarOrdem />} />
          <Route path="/ordens" element={<OrdensServico />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          
          {/* Mercado Livre */}
          <Route path="/ml/produtos" element={<ProdutosML />} />
          <Route path="/ml/cadastrar" element={<CadastroProdutoML />} />
          <Route path="/ml/break-even" element={<BreakEvenML />} />
          <Route path="/ml/configuracoes" element={<ConfiguracoesML />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
