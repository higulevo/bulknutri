import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
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

  return (
    <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Glow sutil */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(255,101,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '380px', position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            {/* bn. em tipografia serifada */}
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '64px',
              fontWeight: '900',
              color: '#FF6500',
              lineHeight: 1,
              letterSpacing: '-2px',
            }}>
              bn.
            </div>
          </div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '22px',
            fontWeight: '700',
            color: '#FF6500',
            letterSpacing: '-0.5px',
          }}>
            bulknutri.
          </div>
          <div style={{ fontSize: '12px', color: '#555555', marginTop: '6px', fontWeight: '500', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Gestão de Estoque
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#111111', border: '1px solid #1A1A1A', borderRadius: '20px', padding: '32px' }}>
          
          {/* Divisor laranja */}
          <div style={{ height: '2px', background: 'linear-gradient(to right, #FF6500, transparent)', marginBottom: '28px', borderRadius: '99px' }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Usuário</label>
              <input className="input" type="text" placeholder="seu usuário"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required autoFocus />
            </div>
            <div>
              <label className="label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" style={{ paddingRight: '44px' }}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555555', cursor: 'pointer', padding: 0 }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{
                marginTop: '8px',
                width: '100%',
                justifyContent: 'center',
                background: loading ? '#CC5200' : '#FF6500',
                color: '#fff',
                fontWeight: '700',
                fontSize: '15px',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s',
                fontFamily: "'Inter', sans-serif",
              }}>
              {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
