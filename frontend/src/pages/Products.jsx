import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, Package, ChevronDown, ChevronUp,
  AlertTriangle, PackageX, Image, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Modal, Confirm, Spinner, Badge, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

const fmt = v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

function StockBadge({ stock, minStock = 5 }) {
  if (stock === 0) return <Badge color="red"><PackageX size={10} /> Sem estoque</Badge>;
  if (stock <= minStock) return <Badge color="yellow"><AlertTriangle size={10} /> Estoque baixo</Badge>;
  return <Badge color="green">{stock} un</Badge>;
}

function VariantRow({ variant, index, onChange, onRemove }) {
  return (
    <div className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50 space-y-2">
      <div className="flex items-center gap-2">
        <input
          className="input text-sm flex-1 py-2"
          placeholder="Nome do sabor/variante *"
          value={variant.name}
          onChange={e => onChange(index, 'name', e.target.value)}
        />
        <button type="button" onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input className="input text-sm py-2" placeholder="SKU"
          value={variant.sku} onChange={e => onChange(index, 'sku', e.target.value)} />
        <input className="input text-sm py-2" placeholder="Preço (opcional)"
          type="number" step="0.01" value={variant.price}
          onChange={e => onChange(index, 'price', e.target.value)} />
        <input className="input text-sm py-2" placeholder="Estoque"
          type="number" value={variant.stock}
          onChange={e => onChange(index, 'stock', e.target.value)} />
      </div>
    </div>
  );
}

/* ── ProductForm FORA do componente principal (evita perda de foco) ── */
function ProductForm({
  product, categories,
  hasVariants, onToggleVariants,
  newVariants, onVariantChange, onVariantRemove, onVariantAdd,
  imagePreview, fileRef, onImageChange,
  onSubmit, onCancel, saving,
  onConfirmVariant,
}) {
  return (
    <form onSubmit={onSubmit} className="p-5 space-y-4">
      {/* Dados básicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Nome do Produto *</label>
          <input className="input" name="name" required defaultValue={product?.name} />
        </div>
        <div>
          <label className="label">Marca</label>
          <input className="input" name="brand" defaultValue={product?.brand} />
        </div>
        <div>
          <label className="label">Categoria</label>
          <select className="input" name="categoryId" defaultValue={product?.categoryId || ''}>
            <option value="">Sem categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Preço de Custo</label>
          <input className="input" name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice || 0} />
        </div>
        <div>
          <label className="label">Preço de Venda</label>
          <input className="input" name="salePrice" type="number" step="0.01" defaultValue={product?.salePrice || 0} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Descrição</label>
          <textarea className="input resize-none h-20" name="description" defaultValue={product?.description} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Foto do Produto</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
              <Image size={15} /> Escolher foto
            </button>
            {imagePreview && <img src={imagePreview} className="w-12 h-12 rounded-xl object-cover border border-dark-600" alt="" />}
            <input ref={fileRef} type="file" name="image" accept="image/*" className="hidden" onChange={onImageChange} />
          </div>
        </div>
      </div>

      {/* Toggle: tem variantes? */}
      <div className="border-t border-dark-700/50 pt-4">
        <button
          type="button"
          onClick={onToggleVariants}
          className="flex items-center gap-3 w-full text-left group"
        >
          {hasVariants
            ? <ToggleRight size={28} className="text-brand-500 flex-shrink-0" />
            : <ToggleLeft size={28} className="text-dark-500 flex-shrink-0" />}
          <div>
            <p className="text-dark-100 text-sm font-semibold">
              {hasVariants ? 'Produto com variantes' : 'Produto sem variantes'}
            </p>
            <p className="text-dark-500 text-xs">
              {hasVariants
                ? 'Ex: Whey Protein com sabores Chocolate, Baunilha...'
                : 'Ex: Coqueteleira, Camiseta, produto único sem sabor/tamanho'}
            </p>
          </div>
        </button>
      </div>

      {/* Sem variantes: estoque direto no produto */}
      {!hasVariants && (
        <div className="bg-dark-800/40 border border-dark-700/50 rounded-xl p-4 space-y-3">
          <p className="text-dark-400 text-xs font-semibold uppercase tracking-wide">Estoque do produto</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estoque atual</label>
              <input className="input" name="stock" type="number" min="0"
                defaultValue={product?.stock ?? 0} />
            </div>
            <div>
              <label className="label">Estoque mínimo</label>
              <input className="input" name="minStock" type="number" min="0"
                defaultValue={product?.minStock ?? 5} />
            </div>
          </div>
        </div>
      )}

      {/* Com variantes */}
      {hasVariants && (
        <div className="space-y-2">
          {/* Variantes já salvas */}
          {product?.variants?.map(v => (
            <div key={v.id} className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-dark-200 text-sm font-medium flex-1">{v.name}</span>
                <StockBadge stock={v.stock} minStock={v.minStock} />
                <button type="button" onClick={() => onConfirmVariant(v.id)}
                  className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg">
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-dark-500 text-xs">Estoque: {v.stock} | Min: {v.minStock} | {v.sku || 'Sem SKU'}</p>
            </div>
          ))}

          {/* Novas variantes */}
          {newVariants.map((v, i) => (
            <VariantRow key={i} index={i} variant={v}
              onChange={onVariantChange} onRemove={onVariantRemove} />
          ))}

          <button type="button" onClick={onVariantAdd}
            className="flex items-center gap-2 text-brand-400 text-sm hover:text-brand-300 px-3 py-2 rounded-xl hover:bg-brand-500/10 transition-all w-full">
            <Plus size={15} /> Adicionar variante
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-dark-700/50">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</> : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

/* ── Componente principal ── */
export default function Products() {
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [expanded, setExpanded]       = useState({});
  const [modal, setModal]             = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [confirm, setConfirm]         = useState(null);
  const [saving, setSaving]           = useState(false);
  const [hasVariants, setHasVariants] = useState(true);
  const [newVariants, setNewVariants] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef();

  const load = useCallback(() => {
    api.get('/products', { params: { search, active: true } })
      .then(r => setProducts(r.data)).finally(() => setLoading(false));
    api.get('/categories').then(r => setCategories(r.data));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditProduct(null);
    setHasVariants(true);
    setNewVariants([]);
    setImagePreview(null);
    setModal('create');
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setHasVariants(p.hasVariants);
    setNewVariants([]);
    setImagePreview(p.image || null);
    setModal('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.target);
      fd.set('hasVariants', hasVariants);

      // Remove campos de estoque do produto se tem variantes (backend ignora, mas fica limpo)
      if (hasVariants) { fd.delete('stock'); fd.delete('minStock'); }

      if (modal === 'create') {
        const res = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (hasVariants) {
          for (const v of newVariants.filter(x => x.name))
            await api.post('/variants', { productId: res.data.id, ...v });
        }
        toast.success('Produto criado!');
      } else {
        await api.put(`/products/${editProduct.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        if (hasVariants) {
          for (const v of newVariants.filter(x => x.name))
            await api.post('/variants', { productId: editProduct.id, ...v });
        }
        toast.success('Produto atualizado!');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    try { await api.delete(`/products/${id}`); toast.success('Produto removido'); setConfirm(null); load(); }
    catch { toast.error('Erro ao remover'); }
  };

  const deleteVariant = async (id) => {
    try { await api.delete(`/variants/${id}`); toast.success('Variante removida'); setConfirm(null); load(); }
    catch { toast.error('Erro ao remover'); }
  };

  const handleVariantChange = useCallback((index, field, val) => {
    setNewVariants(arr => arr.map((x, j) => j === index ? { ...x, [field]: val } : x));
  }, []);
  const handleVariantRemove = useCallback((index) => {
    setNewVariants(arr => arr.filter((_, j) => j !== index));
  }, []);
  const handleVariantAdd = useCallback(() => {
    setNewVariants(v => [...v, { name: '', sku: '', price: '', stock: 0 }]);
  }, []);
  const handleImageChange = useCallback((e) => {
    const f = e.target.files[0]; if (f) setImagePreview(URL.createObjectURL(f));
  }, []);
  const handleToggleVariants = useCallback(() => {
    setHasVariants(v => !v);
    setNewVariants([]);
  }, []);

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Produtos</h1>
          <p className="text-dark-500 text-sm mt-0.5">{products.length} produtos cadastrados</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={17} /> Novo Produto</button>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
        <input className="input pl-10" placeholder="Buscar produtos..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum produto" description="Comece cadastrando seu primeiro produto."
          action={<button onClick={openCreate} className="btn-primary">Cadastrar produto</button>} />
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const totalStock = p.hasVariants
              ? p.variants.reduce((s, v) => s + v.stock, 0)
              : p.stock;
            const minStk = p.hasVariants
              ? (p.variants[0]?.minStock ?? 5)
              : p.minStock;
            return (
              <div key={p.id} className="card overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  {p.image ? (
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover border border-dark-700 flex-shrink-0" alt={p.name} />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-dark-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-dark-50 text-sm">{p.name}</h3>
                      {p.brand && <span className="text-dark-500 text-xs">· {p.brand}</span>}
                      {p.category && <Badge color="teal">{p.category.name}</Badge>}
                      {!p.hasVariants && <Badge color="purple">Sem variante</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-dark-500 text-xs">Custo: {fmt(p.costPrice)}</span>
                      <span className="text-brand-400 text-xs font-semibold">Venda: {fmt(p.salePrice)}</span>
                      <StockBadge stock={totalStock} minStock={minStk} />
                      {p.hasVariants && <span className="text-dark-600 text-xs">{p.variants.length} variante(s)</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => openEdit(p)}
                      className="p-2 rounded-xl text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => setConfirm({ type: 'product', id: p.id, name: p.name })}
                      className="p-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={15} />
                    </button>
                    {p.hasVariants && (
                      <button onClick={() => toggle(p.id)}
                        className="p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors">
                        {expanded[p.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                  </div>
                </div>

                {p.hasVariants && expanded[p.id] && (
                  <div className="border-t border-dark-800 px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {p.variants.map(v => (
                        <div key={v.id} className="bg-dark-800/50 rounded-xl p-3 border border-dark-700/30 relative group">
                          <p className="text-dark-100 text-xs font-semibold mb-1 pr-6">{v.name}</p>
                          <StockBadge stock={v.stock} minStock={v.minStock} />
                          {v.price && <p className="text-brand-400 text-xs mt-1">{fmt(v.price)}</p>}
                          {v.sku && <p className="text-dark-600 text-xs font-mono mt-1">{v.sku}</p>}
                          <button onClick={() => setConfirm({ type: 'variant', id: v.id })}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 p-0.5 hover:bg-red-500/10 rounded transition-all">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Novo Produto' : 'Editar Produto'} size="lg">
        <ProductForm
          product={editProduct}
          categories={categories}
          hasVariants={hasVariants}
          onToggleVariants={handleToggleVariants}
          newVariants={newVariants}
          onVariantChange={handleVariantChange}
          onVariantRemove={handleVariantRemove}
          onVariantAdd={handleVariantAdd}
          imagePreview={imagePreview}
          fileRef={fileRef}
          onImageChange={handleImageChange}
          onSubmit={handleSubmit}
          onCancel={() => setModal(null)}
          saving={saving}
          onConfirmVariant={(id) => setConfirm({ type: 'variant', id })}
        />
      </Modal>

      <Confirm open={!!confirm} onClose={() => setConfirm(null)} danger
        title={confirm?.type === 'product' ? 'Remover produto?' : 'Remover variante?'}
        message={confirm?.type === 'product'
          ? `Tem certeza que deseja remover "${confirm?.name}"?`
          : 'Remover esta variante permanentemente?'}
        confirmLabel="Remover"
        onConfirm={() => confirm.type === 'product' ? deleteProduct(confirm.id) : deleteVariant(confirm.id)}
      />
    </div>
  );
}
