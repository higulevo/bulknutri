import { useEffect, useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Confirm, Spinner, EmptyState } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newName, setNewName]       = useState('');
  const [saving, setSaving]         = useState(false);
  const [confirm, setConfirm]       = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await api.post('/categories', { name: newName.trim() });
      toast.success('Categoria criada!');
      setNewName('');
      load();
    } catch {
      toast.error('Categoria já existe ou erro ao criar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Categoria removida');
      setConfirm(null);
      load();
    } catch {
      toast.error('Não é possível remover categoria com produtos vinculados');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Categorias</h1>
          <p className="text-dark-500 text-sm mt-0.5">{categories.length} categorias cadastradas</p>
        </div>
      </div>

      {/* Formulário de nova categoria */}
      <form onSubmit={create} className="card p-4 mb-5 flex gap-3">
        <input
          className="input flex-1"
          placeholder="Nome da nova categoria..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button type="submit" disabled={saving} className="btn-primary flex-shrink-0">
          {saving
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Plus size={17} />}
          Criar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tag} title="Nenhuma categoria" description="Crie categorias para organizar seus produtos." />
      ) : (
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Tag size={16} className="text-brand-400" />
              </div>
              <span className="flex-1 text-dark-100 font-medium">{c.name}</span>
              <button
                onClick={() => setConfirm({ id: c.id, name: c.name })}
                className="p-2 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Confirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        danger
        title="Remover categoria?"
        message={`Remover "${confirm?.name}"? Produtos vinculados a ela ficarão sem categoria.`}
        confirmLabel="Remover"
        onConfirm={() => remove(confirm.id)}
      />
    </div>
  );
}
