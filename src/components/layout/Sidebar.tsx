import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  History,
  Users,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
  FilePlus,
  ShoppingBag,
  Package,
  Plus,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const climatizacaoItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FilePlus, label: "Cadastrar Ordem", path: "/cadastrar-ordem" },
  { icon: ClipboardList, label: "Ordens de Serviço", path: "/ordens" },
  { icon: History, label: "Histórico", path: "/historico" },
  { icon: Users, label: "Técnicos", path: "/tecnicos" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

const mercadoLivreItems = [
  { icon: Package, label: "Produtos", path: "/ml/produtos" },
  { icon: Plus, label: "Cadastrar Produto", path: "/ml/cadastrar" },
  { icon: Target, label: "Meta de Vendas", path: "/ml/break-even" },
  { icon: Settings, label: "Configurações", path: "/ml/configuracoes" },
];

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
          className="overflow-hidden"
        >
          <img src={logo} alt="Novo Eletroar" className="h-10 object-contain" />
        </motion.div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors hidden lg:block"
        >
          <Menu className="w-5 h-5 text-sidebar-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Climatização Section */}
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
          className="overflow-hidden"
        >
          <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Climatização
          </p>
        </motion.div>
        {climatizacaoItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "sidebar-item group",
                isActive && "active bg-primary/10"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                )}
              />
              <motion.span
                initial={false}
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                className={cn(
                  "overflow-hidden whitespace-nowrap font-medium",
                  isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </motion.span>
            </NavLink>
          );
        })}

        {/* Separator */}
        <div className="my-3 border-t border-sidebar-border" />

        {/* Mercado Livre Section */}
        <motion.div
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
          className="overflow-hidden"
        >
          <div className="px-4 py-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-secondary" />
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Mercado Livre
            </p>
          </div>
        </motion.div>
        {mercadoLivreItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "sidebar-item group",
                isActive && "active bg-secondary/10"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-secondary" : "text-sidebar-foreground group-hover:text-foreground"
                )}
              />
              <motion.span
                initial={false}
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                className={cn(
                  "overflow-hidden whitespace-nowrap font-medium",
                  isActive ? "text-secondary" : "text-sidebar-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </motion.span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="sidebar-item w-full text-sidebar-foreground hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <motion.span
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            className="overflow-hidden whitespace-nowrap font-medium"
          >
            Sair
          </motion.span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent transition-colors"
      >
        <Menu className="w-6 h-6 text-sidebar-foreground" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        className="hidden lg:block fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border z-40"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
