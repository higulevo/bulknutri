import { useEffect, useState } from 'react';
import { Clock, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { Confirm, Spinner, Badge, EmptyState, StatCard } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmt     = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const daysSince = d => Math.floor((new Date() - new Date(d)) / 86400000);

// Mesmo helper seguro usado em Sales e Dashboard
function itemName(item) {
  if (item?.variant?.product?.name) {
    return `${item.variant.product.name} — ${item.variant.name}`;
  }
  if (item?.product?.name) return item.product.name;
  return 'Produto';
}

export default function Pending() {
  const [data, setData]     = useState({ sales: [], totalPending: 0 });
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/sales/pending')
      .then(r => setData(r.data))
      .catch(() => setData({ sales: [], totalPending: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id) => {
    try {
      await api.put(`/sales/${id}/pay`);
      toast.success('Marcado como pago!');
      load();
    } catch { toast.error('Erro'); }
  };

  const deleteSale = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Removido e estoque restaurado');
      setConfirm(null);
      load();
    } catch { toast.error('Erro'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Pagamentos Pendentes</h1>
          <p className="text-dark-500 text-sm mt-0.5">{data.sales.length} clientes devendo</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="A Receber"         value={fmt(data.totalPending)} icon={Clock}          iconColor="yellow" />
        <StatCard label="Clientes Pendentes" value={data.sales.length}    icon={AlertTriangle}   iconColor="red"    />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : data.sales.length === 0 ? (
        <EmptyState icon={CheckCircle} title="Nada pendente!" description="Todos os pagamentos estão em dia." />
      ) : (
        <div className="space-y-3">
          {data.sales.map(sale => {
            const days = daysSince(sale.createdAt);
            return (
              <div key={sale.id} className={`card p-4 border ${days > 7 ? 'border-red-500/20' : 'border-dark-700/50'}`}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-dark-500 text-xs font-mono">#{String(sale.id).padStart(4, '0')}</span>
                      <p className="font-semibold text-dark-50">{sale.customerName || 'Sem nome'}</p>
                      {days > 7
                        ? <Badge color="red"><AlertTriangle size={10} /> {days}d em atraso</Badge>
                        : <Badge color="yellow">{days === 0 ? 'Hoje' : `${days}d atrás`}</Badge>}
                    </div>
                    {sale.customerPhone && (
                      <p className="text-dark-500 text-xs mt-0.5">📞 {sale.customerPhone}</p>
                    )}
                    <div className="mt-2 space-y-0.5">
                      {(sale.items || []).map((item, idx) => (
                        <p key={item.id ?? idx} className="text-dark-500 text-xs">
                          {item.quantity}x {itemName(item)}
                        </p>
                      ))}
                    </div>
                    {sale.note && <p className="text-dark-600 text-xs mt-1 italic">"{sale.note}"</p>}
                    <p className="text-dark-600 text-xs mt-2">
                      {fmtDate(sale.createdAt)} · por {sale.user?.name || '—'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="font-bold text-dark-50 text-lg">{fmt(sale.total)}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => markPaid(sale.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors border border-green-500/20">
                        <CheckCircle size={13} /> Pago
                      </button>
                      <button onClick={() => setConfirm({ id: sale.id })}
                        className="p-1.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} danger
        title="Excluir venda?" message="O estoque será restaurado automaticamente."
        confirmLabel="Excluir" onConfirm={() => deleteSale(confirm.id)} />
    </div>
  );
}
