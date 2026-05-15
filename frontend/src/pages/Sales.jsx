import { useEffect, useState } from 'react';
import { Search, Trash2, ShoppingCart, X, CheckCircle, Tag, Plus } from 'lucide-react';
import { Modal, Confirm, Spinner, Badge, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmt     = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const METHOD_COLORS = { PIX: 'teal', DINHEIRO: 'green', CARTAO: 'blue', FIADO: 'yellow' };
const STATUS_COLORS = { PAGO: 'green', PENDENTE: 'yellow' };

// Nome do item de forma segura para qualquer estrutura
function itemName(item) {
  if (item?.variant?.product?.name) {
    return `${item.variant.product.name}${item.variant.name ? ` — ${item.variant.name}` : ''}`;
  }
  if (item?.product?.name) return item.product.name;
  return 'Produto';
}

export default function Sales() {
  const [sales, setSales]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showNewSale, setShowNewSale]   = useState(false);
  const [confirm, setConfirm]           = useState(null);

  const [products, setProducts]   = useState([]);
  const [cart, setCart]           = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [customer, setCustomer]   = useState({ name: '', phone: '' });
  const [payment, setPayment]     = useState({ method: 'PIX', note: '' });
  const [discount, setDiscount]   = useState({ type: 'percent', value: '' });
  const [saving, setSaving]       = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/sales', { params: { search, status: filterStatus, page } })
      .then(r => { setSales(r.data.sales || []); setTotal(r.data.total || 0); setPages(r.data.pages || 1); })
      .catch(() => { setSales([]); })
      .finally(() => setLoading(false));
  };

  const loadProducts = () => {
    api.get('/products', { params: { search: productSearch, active: true } })
      .then(r => setProducts(r.data || []));
  };

  useEffect(() => { load(); }, [search, filterStatus, page]);
  useEffect(() => { if (showNewSale) loadProducts(); }, [productSearch, showNewSale]);

  /* ── Carrinho ── */
  const addToCart = (product, variant) => {
    const price = variant.price || product.salePrice;
    const key   = `v-${variant.id}`;
    const existing = cart.find(i => i.key === key);
    if (existing) {
      if (existing.quantity >= variant.stock) return toast.error('Estoque insuficiente');
      setCart(c => c.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      if (variant.stock === 0) return toast.error('Sem estoque disponível');
      setCart(c => [...c, { key, variantId: variant.id, productId: null, productName: product.name, variantName: variant.name, unitPrice: price, quantity: 1, maxStock: variant.stock }]);
    }
  };

  const addProductDirect = (product) => {
    if (product.stock === 0) return toast.error('Sem estoque disponível');
    const key = `p-${product.id}`;
    const existing = cart.find(i => i.key === key);
    if (existing) {
      if (existing.quantity >= product.stock) return toast.error('Estoque insuficiente');
      setCart(c => c.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart(c => [...c, { key, variantId: null, productId: product.id, productName: product.name, variantName: null, unitPrice: product.salePrice, quantity: 1, maxStock: product.stock }]);
    }
  };

  const updateQty = (key, qty) => {
    if (qty <= 0) setCart(c => c.filter(i => i.key !== key));
    else setCart(c => c.map(i => i.key === key ? { ...i, quantity: Math.min(qty, i.maxStock) } : i));
  };

  const subtotal      = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountValue = (() => {
    const v = parseFloat(discount.value) || 0;
    return discount.type === 'percent'
      ? Math.min(subtotal, subtotal * v / 100)
      : Math.min(subtotal, v);
  })();
  const cartTotal = subtotal - discountValue;

  const submitSale = async () => {
    if (cart.length === 0) return toast.error('Adicione itens ao carrinho');
    setSaving(true);
    try {
      await api.post('/sales', {
        customerName:  customer.name  || null,
        customerPhone: customer.phone || null,
        paymentMethod: payment.method,
        paymentStatus: payment.method === 'FIADO' ? 'PENDENTE' : 'PAGO',
        note:          payment.note   || null,
        discount:      discountValue,
        items: cart.map(i => ({
          variantId: i.variantId || null,
          productId: i.productId || null,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      toast.success('Venda registrada!');
      setShowNewSale(false);
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setPayment({ method: 'PIX', note: '' });
      setDiscount({ type: 'percent', value: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao registrar venda');
    } finally {
      setSaving(false);
    }
  };

  const deleteSale = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Venda excluída e estoque restaurado');
      setConfirm(null);
      load();
    } catch { toast.error('Erro ao excluir'); }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/sales/${id}/pay`);
      toast.success('Marcado como pago!');
      load();
    } catch { toast.error('Erro'); }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Vendas</h1>
          <p className="text-dark-500 text-sm mt-0.5">{total} vendas registradas</p>
        </div>
        <button onClick={() => setShowNewSale(true)} className="btn-primary">
          <ShoppingCart size={17} /> Nova Venda
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input className="input pl-10" placeholder="Buscar cliente..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos</option>
          <option value="PAGO">Pagos</option>
          <option value="PENDENTE">Pendentes</option>
        </select>
      </div>

      {/* Lista de vendas */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : sales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Nenhuma venda" description="Registre sua primeira venda."
          action={<button onClick={() => setShowNewSale(true)} className="btn-primary">Nova venda</button>} />
      ) : (
        <div className="space-y-3">
          {sales.map(sale => (
            <div key={sale.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-dark-500 text-xs font-mono">#{String(sale.id).padStart(4, '0')}</span>
                    <p className="font-semibold text-dark-50 text-sm">{sale.customerName || 'Cliente não informado'}</p>
                    <Badge color={METHOD_COLORS[sale.paymentMethod]}>{sale.paymentMethod}</Badge>
                    <Badge color={STATUS_COLORS[sale.paymentStatus]}>{sale.paymentStatus}</Badge>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    {(sale.items || []).slice(0, 3).map((item, idx) => (
                      <p key={item.id ?? idx} className="text-dark-500 text-xs">
                        {item.quantity}x {itemName(item)}
                      </p>
                    ))}
                    {(sale.items || []).length > 3 && (
                      <p className="text-dark-600 text-xs">+{sale.items.length - 3} itens</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-dark-600 text-xs">{fmtDate(sale.createdAt)}</span>
                    <span className="text-dark-500 text-xs">por {sale.user?.name || '—'}</span>
                    {sale.discount > 0 && (
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <Tag size={10} /> Desconto: {fmt(sale.discount)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="font-bold text-dark-50">{fmt(sale.total)}</span>
                  <div className="flex gap-1.5">
                    {sale.paymentStatus === 'PENDENTE' && (
                      <button onClick={() => markPaid(sale.id)}
                        className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors" title="Marcar como pago">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => setConfirm({ id: sale.id })}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Modal Nova Venda */}
      <Modal open={showNewSale} onClose={() => setShowNewSale(false)} title="Nova Venda" size="xl">
        <div className="flex flex-col lg:flex-row h-full">

          {/* Seletor de produtos */}
          <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-dark-700/50">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
              <input className="input pl-10 text-sm" placeholder="Buscar produto..." value={productSearch}
                onChange={e => setProductSearch(e.target.value)} />
            </div>
            <div className="space-y-2 max-h-64 lg:max-h-80 overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/30">
                  <p className="text-dark-100 text-sm font-semibold mb-2">
                    {p.name}
                    {p.brand && <span className="text-dark-500 font-normal"> · {p.brand}</span>}
                  </p>

                  {p.hasVariants ? (
                    /* COM variantes: botão por variante mostrando estoque */
                    <div className="flex flex-wrap gap-1.5">
                      {p.variants.filter(v => v.active).map(v => (
                        <button key={v.id} onClick={() => addToCart(p, v)} disabled={v.stock === 0}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            v.stock === 0
                              ? 'border-dark-700 text-dark-600 cursor-not-allowed line-through'
                              : 'border-dark-600 text-dark-200 hover:border-brand-500 hover:text-brand-400 hover:bg-brand-500/10'
                          }`}>
                          {v.name} <span className={v.stock <= (v.minStock || 5) && v.stock > 0 ? 'text-yellow-400' : ''}>(
                            {v.stock})</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* SEM variantes: botão único mostrando estoque */
                    <button
                      onClick={() => addProductDirect(p)}
                      disabled={p.stock === 0}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        p.stock === 0
                          ? 'border-dark-700 text-dark-600 cursor-not-allowed line-through'
                          : 'border-brand-500/40 text-brand-400 hover:bg-brand-500/10'
                      }`}>
                      <Plus size={13} />
                      Adicionar — {fmt(p.salePrice)}
                      <span className={`ml-1 ${p.stock <= (p.minStock || 5) && p.stock > 0 ? 'text-yellow-400' : 'text-dark-400'}`}>
                        ({p.stock} em estoque)
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carrinho */}
          <div className="w-full lg:w-80 p-5 flex flex-col">
            <h4 className="font-semibold text-dark-100 text-sm mb-3 flex items-center gap-2">
              <ShoppingCart size={15} className="text-brand-400" /> Carrinho ({cart.length})
            </h4>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-dark-600 text-sm text-center">Adicione produtos ao carrinho</p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-y-auto mb-4 max-h-48 lg:max-h-56">
                {cart.map(item => (
                  <div key={item.key} className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/30">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-dark-100 text-xs font-medium truncate">{item.productName}</p>
                        {item.variantName && <p className="text-dark-500 text-xs">{item.variantName}</p>}
                      </div>
                      <button onClick={() => updateQty(item.key, 0)}
                        className="text-dark-500 hover:text-red-400 flex-shrink-0"><X size={14} /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.key, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 text-sm flex items-center justify-center">−</button>
                        <span className="text-dark-100 text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.key, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 text-sm flex items-center justify-center">+</button>
                      </div>
                      <span className="text-brand-400 text-sm font-semibold">{fmt(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cliente + pagamento */}
            <div className="space-y-2.5 border-t border-dark-700/50 pt-3">
              <input className="input text-sm" placeholder="Nome do cliente" value={customer.name}
                onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))} />
              <input className="input text-sm" placeholder="Telefone (opcional)" value={customer.phone}
                onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))} />
              <select className="input text-sm" value={payment.method}
                onChange={e => setPayment(p => ({ ...p, method: e.target.value }))}>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO">Cartão</option>
                <option value="FIADO">Fiado (Pendente)</option>
              </select>

              {/* Desconto */}
              <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/30">
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag size={13} className="text-brand-400" />
                  <span className="text-dark-300 text-xs font-semibold">Desconto</span>
                </div>
                <div className="flex gap-2">
                  <select className="input text-sm py-2 w-24 flex-shrink-0" value={discount.type}
                    onChange={e => setDiscount(d => ({ ...d, type: e.target.value, value: '' }))}>
                    <option value="percent">%</option>
                    <option value="fixed">R$</option>
                  </select>
                  <input className="input text-sm py-2" type="number" min="0"
                    max={discount.type === 'percent' ? 100 : subtotal}
                    step={discount.type === 'percent' ? '1' : '0.01'}
                    placeholder={discount.type === 'percent' ? 'Ex: 10' : 'Ex: 15,00'}
                    value={discount.value}
                    onChange={e => setDiscount(d => ({ ...d, value: e.target.value }))} />
                </div>
                {discountValue > 0 && (
                  <p className="text-green-400 text-xs mt-1.5">Desconto: -{fmt(discountValue)}</p>
                )}
              </div>

              <textarea className="input text-sm resize-none h-14" placeholder="Observação..."
                value={payment.note} onChange={e => setPayment(p => ({ ...p, note: e.target.value }))} />
            </div>

            {/* Total + finalizar */}
            <div className="border-t border-dark-700/50 pt-3 mt-3">
              <div className="space-y-1 mb-3">
                {discountValue > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-dark-500 text-xs">Subtotal</span>
                      <span className="text-dark-400 text-xs">{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-400 text-xs">Desconto</span>
                      <span className="text-green-400 text-xs">-{fmt(discountValue)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 text-sm font-medium">Total</span>
                  <span className="text-xl font-bold text-dark-50">{fmt(cartTotal)}</span>
                </div>
              </div>
              <button onClick={submitSale} disabled={saving || cart.length === 0}
                className="btn-primary w-full justify-center">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <CheckCircle size={17} />}
                {saving ? 'Salvando...' : 'Finalizar Venda'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} danger
        title="Excluir venda?"
        message="O estoque será restaurado automaticamente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => deleteSale(confirm.id)} />
    </div>
  );
}
