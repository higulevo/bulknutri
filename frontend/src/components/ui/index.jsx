import { X, AlertTriangle, Loader2 } from 'lucide-react';

// Modal
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-dark-900 border border-dark-700/50 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50 flex-shrink-0">
          <h2 className="font-bold text-dark-50 text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// Confirm Dialog
export function Confirm({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', danger = false, loading = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-dark-900 border border-dark-700/50 rounded-2xl shadow-2xl p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? 'bg-red-500/10' : 'bg-brand-500/10'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-400' : 'text-brand-400'} />
        </div>
        <h3 className="font-bold text-dark-50 text-base mb-2">{title}</h3>
        <p className="text-dark-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 justify-center font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${danger ? 'bg-red-500 hover:bg-red-400 text-white' : 'btn-primary'}`}>
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Spinner
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-brand-500" />;
}

// Badge
export function Badge({ children, color = 'gray' }) {
  const colors = {
    gray: 'bg-dark-700 text-dark-300',
    green: 'bg-green-500/15 text-green-400 border border-green-500/20',
    red: 'bg-red-500/15 text-red-400 border border-red-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    teal: 'bg-brand-500/15 text-brand-400 border border-brand-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  };
  return <span className={`badge ${colors[color] || colors.gray}`}>{children}</span>;
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-dark-500" />
      </div>
      <h3 className="font-semibold text-dark-200 mb-1">{title}</h3>
      <p className="text-dark-500 text-sm mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// Stat card
export function StatCard({ label, value, icon: Icon, iconColor = 'teal', sub, trend }) {
  const colors = {
    teal: 'bg-brand-500/10 text-brand-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-dark-400 text-sm font-medium">{label}</span>
        {Icon && <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[iconColor] || colors.teal}`}><Icon size={18} /></div>}
      </div>
      <div>
        <p className="text-2xl font-bold text-dark-50">{value}</p>
        {sub && <p className="text-dark-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
