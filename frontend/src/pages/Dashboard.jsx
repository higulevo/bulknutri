import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, TrendingUp, Clock, AlertTriangle, ShoppingBag, DollarSign, PackageX, CheckCircle } from 'lucide-react';
import { StatCard, Spinner, Badge } from '../components/ui';
import api from '../utils/api';

const fmt = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const payBadge    = { PAGO: 'green', PENDENTE: 'yellow' };
const methodBadge = { PIX: 'teal', DINHEIRO: 'green', CARTAO: 'blue', FIADO: 'yellow' };

// Retorna o nome do produto/variante de forma segura para qualquer estrutura de item
function itemLabel(item) {
  if (item.variant?.product) return `${item.variant.product.name} — ${item.variant.name}`;
  if (item.product)           return item.product.name;
  return 'Produto';
}

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Erro ao carregar dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;
  if (error)   return <div className="text-red-400 text-center py-16">{error}</div>;
  if (!data)   return null;

  const chartData = (data.last7Days || []).map(d => ({
    day:   new Date(d.day + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
    total: Number(d.total) || 0,
    count: Number(d.count) || 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-50">Dashboard</h1>
        <p className="text-dark-500 text-sm mt-0.5">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Total Produtos"  value={data.products.total}     icon={Package}      iconColor="teal"   />
        <StatCard label="Disponíveis"     value={data.products.available} icon={CheckCircle}  iconColor="green"  />
        <StatCard label="Estoque Baixo"   value={data.products.lowStock}  icon={AlertTriangle} iconColor="yellow" />
        <StatCard label="Sem Estoque"     value={data.products.outOfStock} icon={PackageX}    iconColor="red"    />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
        <StatCard label="Faturamento Total" value={fmt(data.revenue.total)}   icon={DollarSign} iconColor="green"  />
        <StatCard label="A Receber"         value={fmt(data.revenue.pending)} icon={Clock}      iconColor="yellow" />
        <StatCard label="Vendas Hoje"       value={`${data.todaySales.count} vendas`} icon={ShoppingBag} iconColor="teal" sub={fmt(data.todaySales.total)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-dark-100 mb-4 text-sm">Faturamento — Últimos 7 dias</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }} formatter={v => [fmt(v), 'Faturamento']} />
                <Area type="monotone" dataKey="total" stroke="#f97316" strokeWidth={2} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-dark-600 text-sm text-center py-8">Sem dados ainda</p>}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-dark-100 mb-4 text-sm">Nº de Vendas — Últimos 7 dias</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }} formatter={v => [v, 'Vendas']} />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-dark-600 text-sm text-center py-8">Sem dados ainda</p>}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top vendidos */}
        <div className="card p-5">
          <h3 className="font-semibold text-dark-100 mb-4 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-400" /> Mais Vendidos
          </h3>
          <div className="space-y-3">
            {(data.topSelling || []).length === 0 && <p className="text-dark-600 text-sm">Sem dados</p>}
            {(data.topSelling || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-dark-800 flex items-center justify-center text-xs font-bold text-dark-400">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-100 text-sm font-medium truncate">
                    {item.variant?.product?.name || item.product?.name || 'Produto'}
                  </p>
                  {item.variant && (
                    <p className="text-dark-500 text-xs truncate">{item.variant.name}</p>
                  )}
                </div>
                <span className="text-brand-400 text-sm font-bold">{item._sum?.quantity ?? 0}un</span>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas vendas */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-dark-100 mb-4 text-sm">Últimas Vendas</h3>
          <div className="space-y-2.5">
            {(data.recentSales || []).length === 0 && <p className="text-dark-600 text-sm">Nenhuma venda ainda</p>}
            {(data.recentSales || []).map(sale => (
              <div key={sale.id} className="flex items-center gap-3 py-2 border-b border-dark-800/50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-dark-100 text-sm font-medium">{sale.customerName || 'Sem nome'}</p>
                    <Badge color={methodBadge[sale.paymentMethod]}>{sale.paymentMethod}</Badge>
                    <Badge color={payBadge[sale.paymentStatus]}>{sale.paymentStatus}</Badge>
                  </div>
                  <p className="text-dark-500 text-xs mt-0.5">
                    {fmtDate(sale.createdAt)} · {(sale.items || []).length} item(s)
                  </p>
                </div>
                <span className="text-dark-50 font-semibold text-sm">{fmt(sale.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
