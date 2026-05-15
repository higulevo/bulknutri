import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Dumbbell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch {
      toast.error('Usuário ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (username) => {
    setForm({ username, password: `${username}123` });
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      {/* Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-brand-500/30">
            <Dumbbell size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            <span className="text-brand-500">Bulk</span>Nutri
          </h1>
          <p className="text-dark-500 text-sm mt-1.5">Sistema de Gestão</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Usuário</label>
              <input className="input" type="text" placeholder="seu usuário" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input className="input pr-11" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 py-3">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Dumbbell size={18} />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Acesso rápido */}
          <div className="mt-5 pt-5 border-t border-dark-700/50">
            <p className="text-dark-600 text-xs text-center mb-3">Acesso rápido</p>
            <div className="grid grid-cols-3 gap-2">
              {['higor', 'fernando', 'gabriel'].map(u => (
                <button key={u} onClick={() => quickLogin(u)}
                  className="py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 hover:text-dark-100 text-xs font-medium capitalize transition-all">
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
