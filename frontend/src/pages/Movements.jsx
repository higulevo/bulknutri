import { useEffect, useState } from 'react';
import { BarChart3, RotateCcw, Trash2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Confirm, Spinner, Badge, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', {
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
});

const TYPE_INFO = {
  ENTRADA: { label: 'Entrada', color: 'green',  icon: TrendingUp  },
  SAIDA:   { label: 'Saída',   color: 'red',    icon: TrendingDown },
  VENDA:   { label: 'Venda',   color: 'blue',   icon: TrendingDown },
  AJUSTE:  { label: 'Ajuste',  color: 'purple', icon: RefreshCw   },
  ESTORNO: { label: 'Estorno', color: 'yellow', icon: RotateCcw   },
};

// Retorna o nome do produto de forma segura para movimentos
// com variante (m.variant.product.name) ou sem (m.product.name)
function movementProductName(m) {
  if (m.variant?.product?.name) return m.variant.product.name;
  if (m.product?.name)          return m.product.name;
  return 'Produto removido';
}

function movementVariantName(m) {
  if (m.variant?.name) return m.variant.name;
  return null;
}

export default function Movements() {
  const [data, setData]             = useState({ movements: [], total: 0, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [page, setPage]             = useState(1);
  const [filterType, setFilterType] = useState('');
  const [confirm, setConfirm]       = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/movements', { params: { type: filterType, page } })
      .then(r => setData(r.data))
      .catch(() => setError('Erro ao carregar movimentações'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterType, page]);

  const revert = async (id) => {
    try {
      await api.delete(`/movements/${id}/revert`);
      toast.success('Movimentação revertida');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao reverter');
      setConfirm(null);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/movements/${id}`);
      toast.success('Registro excluído');
      setConfirm(null);
      load();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Movimentações</h1>
          <p className="text-dark-500 text-sm mt-0.5">{data.total} registros</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'ENTRADA', 'VENDA', 'SAIDA', 'AJUSTE', 'ESTORNO'].map(t => (
          <button key={t}
            onClick={() => { setFilterType(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all
              ${filterType === t ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
            {t || 'Todos'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : error ? (
        <div className="text-red-400 text-center py-16">{error}</div>
      ) : data.movements.length === 0 ? (
        <EmptyState icon={BarChart3} title="Sem movimentações" description="As movimentações aparecerão aqui." />
      ) : (
        <div className="space-y-2">
          {data.movements.map(m => {
            const info   = TYPE_INFO[m.type] || { label: m.type, color: 'gray', icon: RefreshCw };
            const Icon   = info.icon;
            const isVenda = !!m.saleId;
            const prodName    = movementProductName(m);
            const variantName = movementVariantName(m);

            return (
              <div key={m.id} className="card p-4 flex items-center gap-3">
                {/* Ícone */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${m.quantity > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <Icon size={16} className={m.quantity > 0 ? 'text-green-400' : 'text-red-400'} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge color={info.color}>{info.label}</Badge>
                    <p className="text-dark-100 text-sm font-medium">{prodName}</p>
                    {variantName && (
                      <span className="text-dark-500 text-xs">· {variantName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-dark-600 text-xs">{fmtDate(m.createdAt)}</span>
                    <span className="text-dark-500 text-xs">por {m.user?.name || '—'}</span>
                    {m.sale && (
                      <span className="text-dark-600 text-xs">
                        Venda #{m.sale.id}{m.sale.customerName ? ` · ${m.sale.customerName}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantidade e ações */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-bold text-sm ${m.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                  </span>
                  <div className="flex gap-1">
                    {!isVenda && (
                      <button
                        onClick={() => setConfirm({ type: 'revert', id: m.id })}
                        title="Reverter (ajusta estoque de volta)"
                        className="p-1.5 rounded-lg text-dark-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                        <RotateCcw size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setConfirm({ type: 'delete', id: m.id, isVenda })}
                      title={isVenda ? 'Excluir registro (não altera estoque)' : 'Excluir registro'}
                      className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                ${p === page ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.type === 'revert' ? 'Reverter movimentação?' : 'Excluir registro?'}
        message={
          confirm?.type === 'revert'
            ? 'O estoque será ajustado de volta automaticamente.'
            : confirm?.isVenda
              ? 'Movimentação de venda: só o registro será removido, o estoque não muda. Para restaurar o estoque, exclua a venda na tela de Vendas.'
              : 'O registro será removido. O estoque não será alterado.'
        }
        confirmLabel={confirm?.type === 'revert' ? 'Reverter' : 'Excluir'}
        danger={confirm?.type === 'delete'}
        onConfirm={() => confirm?.type === 'revert' ? revert(confirm.id) : remove(confirm.id)}
      />
    </div>
  );
}
