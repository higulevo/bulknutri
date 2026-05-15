import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Clock, BarChart3,
  PackagePlus, LogOut, Menu, ChevronRight, Dumbbell, Tag
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'            },
  { to: '/products',    icon: Package,          label: 'Produtos'             },
  { to: '/categories',  icon: Tag,              label: 'Categorias'           },
  { to: '/sales',       icon: ShoppingCart,     label: 'Vendas'               },
  { to: '/stock-entry', icon: PackagePlus,      label: 'Entrada de Estoque'   },
  { to: '/pending',     icon: Clock,            label: 'Pagamentos Pendentes' },
  { to: '/movements',   icon: BarChart3,        label: 'Movimentações'        },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <>
      <div className="px-6 py-6 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Dumbbell size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-dark-50 text-base tracking-tight">
              <span className="text-brand-500">Bulk</span>Nutri
            </p>
            <p className="text-dark-500 text-xs">Gestão de Suplementos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-dark-400 hover:bg-dark-800 hover:text-dark-100'}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-400' : 'text-dark-500 group-hover:text-dark-300'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-brand-400 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-dark-700/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-800/50 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dark-100 text-sm font-medium truncate">{user?.name}</p>
            <p className="text-dark-500 text-xs truncate">@{user?.username}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all">
          <LogOut size={16} /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <aside className="hidden lg:flex lg:w-64 flex-col bg-dark-900 border-r border-dark-700/50 flex-shrink-0">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-900 border-r border-dark-700/50 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3.5 bg-dark-900 border-b border-dark-700/50">
          <button onClick={() => setOpen(true)} className="p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Dumbbell size={14} className="text-white" />
            </div>
            <span className="font-black text-dark-50 text-sm"><span className="text-brand-500">Bulk</span>Nutri</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
