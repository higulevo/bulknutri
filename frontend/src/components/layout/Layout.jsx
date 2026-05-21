import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Clock, BarChart3,
  PackagePlus, LogOut, Menu, Tag, X
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

function Logo({ size = 'md' }) {
  const big = size === 'lg';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? '14px' : '10px' }}>
      {/* Ícone bn. */}
      <div style={{
        width: big ? 44 : 34, height: big ? 44 : 34,
        borderRadius: big ? 12 : 10,
        background: '#FF6500',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: '900',
          fontSize: big ? 18 : 14,
          color: '#000',
          letterSpacing: '-1px',
          lineHeight: 1,
        }}>bn.</span>
      </div>
      <div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: '700',
          fontSize: big ? 18 : 14,
          color: '#F5F5F5',
          letterSpacing: '-0.3px',
          lineHeight: 1,
        }}>
          <span style={{ color: '#FF6500' }}>bulk</span>nutri.
        </div>
        {big && <div style={{ fontSize: 11, color: '#555555', marginTop: 2, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Gestão de Estoque</div>}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItems = ({ onNavigate }) => (
    <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '10px',
            fontSize: '13.5px', fontWeight: isActive ? '600' : '400',
            color: isActive ? '#FF6500' : '#777777',
            background: isActive ? 'rgba(255,101,0,0.08)' : 'transparent',
            textDecoration: 'none',
            transition: 'all 0.15s',
            borderLeft: isActive ? '2px solid #FF6500' : '2px solid transparent',
          })}
          onMouseOver={e => { if (!e.currentTarget.style.color.includes('255,101')) e.currentTarget.style.color = '#BBBBBB'; }}
          onMouseOut={e => { if (!e.currentTarget.style.color.includes('255,101')) e.currentTarget.style.color = '#777777'; }}
        >
          {({ isActive }) => (
            <>
              <Icon size={16} style={{ color: isActive ? '#FF6500' : '#555555', flexShrink: 0 }} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const SidebarFooter = () => (
    <div style={{ padding: '12px', borderTop: '1px solid #1A1A1A' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#1A1A1A', marginBottom: '6px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#FF6500',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000', fontWeight: 700, fontSize: 13,
          fontFamily: "'Playfair Display', serif",
          flexShrink: 0,
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#DDDDDD', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
          <p style={{ fontSize: 11, color: '#555555', margin: 0 }}>@{user?.username}</p>
        </div>
      </div>
      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '8px 12px', borderRadius: '10px',
        background: 'none', border: 'none', color: '#555555',
        fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
      }}
        onMouseOver={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
        onMouseOut={e => { e.currentTarget.style.color = '#555555'; e.currentTarget.style.background = 'none'; }}>
        <LogOut size={15} /> Sair da conta
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#000000' }}>

      {/* Sidebar Desktop */}
      <aside style={{
        width: 220, flexDirection: 'column',
        background: '#0A0A0A', borderRight: '1px solid #1A1A1A', flexShrink: 0,
      }} className="hidden lg:flex lg:flex-col">
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1A1A1A' }}>
          <Logo size="lg" />
        </div>
        <NavItems onNavigate={() => {}} />
        <SidebarFooter />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} className="lg:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} onClick={() => setOpen(false)} />
          <aside style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 240,
            background: '#0A0A0A', borderRight: '1px solid #1A1A1A',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '18px 16px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo />
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#555555', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Mobile header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 16px', background: '#0A0A0A', borderBottom: '1px solid #1A1A1A',
        }} className="lg:hidden">
          <button onClick={() => setOpen(true)} style={{
            background: '#1A1A1A', border: '1px solid #252525',
            borderRadius: '10px', padding: '8px', color: '#777777', cursor: 'pointer',
          }}>
            <Menu size={18} />
          </button>
          <Logo />
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }} className="lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
