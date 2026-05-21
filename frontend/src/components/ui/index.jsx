import { X, AlertTriangle, Loader2 } from 'lucide-react';

// ── Modal ──────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col`}
        style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
        {/* Header com divisor laranja */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <h2 className="font-bold text-bn-gray-50 text-base tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: '#1A1A1A', color: '#777777' }}
            onMouseOver={e => e.currentTarget.style.color='#DDDDDD'}
            onMouseOut={e => e.currentTarget.style.color='#777777'}>
            <X size={16} />
          </button>
        </div>
        <hr className="bn-divider mx-5" />
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm ────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = false, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6"
        style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ background: danger ? 'rgba(248,113,113,0.1)' : 'rgba(255,101,0,0.1)' }}>
          <AlertTriangle size={20} style={{ color: danger ? '#f87171' : '#FF6500' }} />
        </div>
        <h3 className="font-bold text-bn-gray-50 text-base mb-2">{title}</h3>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#777777' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 justify-center font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-white text-sm"
            style={{ background: danger ? '#ef4444' : '#FF6500' }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin" style={{ color: '#FF6500' }} />;
}

// ── Badge ──────────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const styles = {
    gray:   { background: 'rgba(85,85,85,0.2)',   color: '#999999' },
    green:  { background: 'rgba(74,222,128,0.1)',  color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' },
    red:    { background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' },
    yellow: { background: 'rgba(250,204,21,0.1)',  color: '#facc15', border: '1px solid rgba(250,204,21,0.2)' },
    blue:   { background: 'rgba(96,165,250,0.1)',  color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' },
    teal:   { background: 'rgba(255,101,0,0.1)',   color: '#FF8533', border: '1px solid rgba(255,101,0,0.2)' },
    purple: { background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' },
  };
  return <span className="badge" style={styles[color] || styles.gray}>{children}</span>;
}

// ── EmptyState ─────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: '#1A1A1A' }}>
        <Icon size={26} style={{ color: '#333333' }} />
      </div>
      <h3 className="font-semibold mb-1" style={{ color: '#BBBBBB' }}>{title}</h3>
      <p className="text-sm mb-5 max-w-xs" style={{ color: '#555555' }}>{description}</p>
      {action}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, iconColor = 'teal', sub }) {
  const iconStyles = {
    teal:   { background: 'rgba(255,101,0,0.1)',   color: '#FF6500' },
    green:  { background: 'rgba(74,222,128,0.1)',  color: '#4ade80' },
    red:    { background: 'rgba(248,113,113,0.1)', color: '#f87171' },
    yellow: { background: 'rgba(250,204,21,0.1)',  color: '#facc15' },
    blue:   { background: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
    purple: { background: 'rgba(167,139,250,0.1)', color: '#a78bfa' },
  };
  const s = iconStyles[iconColor] || iconStyles.teal;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>{label}</span>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={s}>
            <Icon size={17} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: '#F5F5F5' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#555555' }}>{sub}</p>}
    </div>
  );
}
