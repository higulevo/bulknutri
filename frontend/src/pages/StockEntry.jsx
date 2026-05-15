import { useEffect, useState } from 'react';
import { PackagePlus, Search, Plus } from 'lucide-react';
import { Spinner, Badge, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StockEntry() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(null);
  const [qtys, setQtys]         = useState({}); // key -> quantidade

  const load = () => {
    setLoading(true);
    api.get('/products', { params: { search, active: true } })
      .then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const setQty = (key, value) => setQtys(q => ({ ...q, [key]: value }));

  const submitVariant = async (variant, product) => {
    const key = `v-${variant.id}`;
    const qty = parseInt(qtys[key]);
    if (!qty || qty <= 0) return toast.error('Informe uma quantidade válida');
    setSaving(key);
    try {
      await api.post(`/variants/${variant.id}/entry`, { quantity: qty });
      toast.success(`+${qty} un adicionado — ${product.name} · ${variant.name}`);
      setQtys(q => ({ ...q, [key]: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro');
    } finally { setSaving(null); }
  };

  const submitProduct = async (product) => {
    const key = `p-${product.id}`;
    const qty = parseInt(qtys[key]);
    if (!qty || qty <= 0) return toast.error('Informe uma quantidade válida');
    setSaving(key);
    try {
      await api.post(`/products/${product.id}/entry`, { quantity: qty });
      toast.success(`+${qty} un adicionado — ${product.name}`);
      setQtys(q => ({ ...q, [key]: '' }));
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro');
    } finally { setSaving(null); }
  };

  const StockLabel = ({ stock, minStock }) => (
    <span className={`text-xs font-semibold ${stock === 0 ? 'text-red-400' : stock <= minStock ? 'text-yellow-400' : 'text-green-400'}`}>
      {stock} un
    </span>
  );

  const EntryRow = ({ entryKey, label, stock, minStock, onSubmit, isSaving }) => (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-dark-100 text-sm font-medium">{label}</p>
        <p className="text-dark-500 text-xs">
          Estoque atual: <StockLabel stock={stock} minStock={minStock} />
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          className="input w-24 text-sm text-center py-2"
          type="number"
          min="1"
          placeholder="Qtd"
          value={qtys[entryKey] || ''}
          onChange={e => setQty(entryKey, e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit()}
        />
        <button
          onClick={onSubmit}
          disabled={isSaving}
          className="btn-primary py-2 px-3"
        >
          {isSaving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Entrada de Estoque</h1>
          <p className="text-dark-500 text-sm mt-0.5">Registre a chegada de novos produtos</p>
        </div>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
        <input className="input pl-10" placeholder="Buscar produto..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={PackagePlus} title="Nenhum produto" description="Cadastre produtos primeiro." />
      ) : (
        <div className="space-y-4">
          {products.map(p => (
            <div key={p.id} className="card overflow-hidden">
              {/* Cabeçalho do produto */}
              <div className="px-4 py-3 border-b border-dark-800/60 flex items-center gap-3">
                {p.image ? (
                  <img src={p.image} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                    <PackagePlus size={16} className="text-dark-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-50 text-sm">{p.name}</p>
                  {p.brand && <p className="text-dark-500 text-xs">{p.brand}</p>}
                </div>
                {!p.hasVariants && <Badge color="purple">Sem variante</Badge>}
              </div>

              {/* Linhas de entrada */}
              <div className="divide-y divide-dark-800/50">
                {p.hasVariants
                  ? p.variants.filter(v => v.active).map(v => (
                      <EntryRow
                        key={v.id}
                        entryKey={`v-${v.id}`}
                        label={v.name}
                        stock={v.stock}
                        minStock={v.minStock}
                        onSubmit={() => submitVariant(v, p)}
                        isSaving={saving === `v-${v.id}`}
                      />
                    ))
                  : (
                      <EntryRow
                        entryKey={`p-${p.id}`}
                        label="Estoque do produto"
                        stock={p.stock}
                        minStock={p.minStock}
                        onSubmit={() => submitProduct(p)}
                        isSaving={saving === `p-${p.id}`}
                      />
                    )
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
