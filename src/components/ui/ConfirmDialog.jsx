import Modal from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false, variant = 'danger' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${variant === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50
              ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
