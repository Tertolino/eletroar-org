import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
          {/* Auth - Public */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Climatização - Protected */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cadastrar-ordem" element={<ProtectedRoute><CadastrarOrdem /></ProtectedRoute>} />
          <Route path="/editar-ordem/:id" element={<ProtectedRoute><EditarOrdem /></ProtectedRoute>} />
          <Route path="/ordens" element={<ProtectedRoute><OrdensServico /></ProtectedRoute>} />
          <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
          <Route path="/tecnicos" element={<ProtectedRoute><Tecnicos /></ProtectedRoute>} />
          <Route path="/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
          <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
          
          {/* Mercado Livre - Protected */}
          <Route path="/ml/produtos" element={<ProtectedRoute><ProdutosML /></ProtectedRoute>} />
          <Route path="/ml/cadastrar" element={<ProtectedRoute><CadastroProdutoML /></ProtectedRoute>} />
          <Route path="/ml/break-even" element={<ProtectedRoute><BreakEvenML /></ProtectedRoute>} />
          <Route path="/ml/configuracoes" element={<ProtectedRoute><ConfiguracoesML /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
