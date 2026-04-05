import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ArrowLeftRight, CheckCircle, Clock, Loader2, ChevronLeft, ChevronRight, Download, Package } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { format } from 'date-fns';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const IMG_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

function BorrowForm({ onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [barcode, setBarcode] = useState('');
  const [equipment, setEquipment] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    borrowerName: '', department: '', contactNumber: '', purpose: '',
    quantityBorrowed: 1, expectedReturn: '', notes: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const searchEquipment = async (q) => {
    if (!q) return setEquipmentList([]);
    setLoading(true);
    try {
      const res = await API.get('/equipment', { params: { search: q, limit: 5 } });
      setEquipmentList(res.data.equipment.filter(e => !e.isUnderMaintenance && e.availableStock > 0));
    } finally {
      setLoading(false);
    }
  };

  const searchByBarcode = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const res = await API.get(`/equipment/barcode/${barcode.trim()}`);
      if (res.data.isUnderMaintenance) return toast.error('Item under maintenance');
      if (res.data.availableStock < 1) return toast.error('No stock available');
      setEquipment(res.data);
      setStep(2);
    } catch {
      toast.error('Equipment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/borrow', { equipmentId: equipment._id, ...form });
      toast.success('Item borrowed successfully');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to borrow');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 1) return (
    <div className="p-6 space-y-4">
      <div>
        <p className="font-medium text-slate-900 dark:text-white mb-3">Find Equipment</p>
        <div className="space-y-3">
          <div>
            <label className="label">Search by Name</label>
            <input className="input" placeholder="Search equipment..." value={equipmentSearch} onChange={e => { setEquipmentSearch(e.target.value); searchEquipment(e.target.value); }} />
            {equipmentList.length > 0 && (
              <div className="mt-2 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                {equipmentList.map(e => (
                  <button key={e._id} type="button" onClick={() => { setEquipment(e); setStep(2); setEquipmentList([]); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                      {e.image ? <img src={IMG_BASE + e.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400 m-auto mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.availableStock} available · {e.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
            <span className="text-xs text-slate-400">or scan barcode</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-600" />
          </div>

          <div>
            <label className="label">Enter Barcode</label>
            <div className="flex gap-2">
              <input className="input font-mono" placeholder="Enter barcode..." value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchByBarcode()} />
              <button type="button" onClick={searchByBarcode} disabled={loading} className="btn-primary px-4 whitespace-nowrap">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Equipment summary */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-slate-700 flex-shrink-0">
          {equipment.image ? <img src={IMG_BASE + equipment.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-400 m-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 dark:text-white">{equipment.name}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">{equipment.availableStock} units available</p>
        </div>
        <button type="button" onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white">Change</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Borrower Name *</label>
          <input className="input" value={form.borrowerName} onChange={e => set('borrowerName', e.target.value)} required placeholder="Full name" />
        </div>
        <div>
          <label className="label">Department *</label>
          <input className="input" value={form.department} onChange={e => set('department', e.target.value)} required placeholder="e.g. IT Department" />
        </div>
        <div>
          <label className="label">Contact Number</label>
          <input className="input" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="label">Quantity *</label>
          <input type="number" min="1" max={equipment.availableStock} className="input" value={form.quantityBorrowed} onChange={e => set('quantityBorrowed', parseInt(e.target.value))} required />
        </div>
        <div>
          <label className="label">Expected Return *</label>
          <input type="date" className="input" value={form.expectedReturn} min={new Date().toISOString().split('T')[0]} onChange={e => set('expectedReturn', e.target.value)} required />
        </div>
        <div className="col-span-2">
          <label className="label">Purpose</label>
          <input className="input" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder="Reason for borrowing" />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea className="input resize-none h-16" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Confirm Borrow
        </button>
      </div>
    </form>
  );
}

function ReturnForm({ log, onSave, onClose }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    setLoading(true);
    try {
      await API.put(`/borrow/${log._id}/return`, { notes });
      toast.success('Item returned successfully');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
        <p className="font-medium text-slate-900 dark:text-white">{log.equipment?.name}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          <span>Borrower: <strong>{log.borrowerName}</strong></span>
          <span>Dept: <strong>{log.department}</strong></span>
          <span>Qty: <strong>{log.quantityBorrowed}</strong></span>
          <span>Due: <strong className={new Date(log.expectedReturn) < new Date() ? 'text-red-500' : ''}>{format(new Date(log.expectedReturn), 'MMM d, yyyy')}</strong></span>
        </div>
      </div>
      <div>
        <label className="label">Return Notes (Optional)</label>
        <textarea className="input resize-none h-20" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condition notes, damage report, etc." />
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleReturn} disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <CheckCircle className="w-4 h-4" /> Confirm Return
        </button>
      </div>
    </div>
  );
}

const statusBadge = (status) => {
  const map = { Borrowed: 'badge-blue', Returned: 'badge-green', Overdue: 'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

export default function BorrowPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(search);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [returnLog, setReturnLog] = useState(null);
  const [barcodeReturn, setBarcodeReturn] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: debouncedSearch };
      if (statusFilter) params.status = statusFilter;
      const res = await API.get('/borrow', { params });
      setLogs(res.data.logs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const handleBarcodeReturn = async () => {
    if (!barcodeReturn.trim()) return;
    setBarcodeLoading(true);
    try {
      // Find active borrow by barcode
      const eqRes = await API.get(`/equipment/barcode/${barcodeReturn.trim()}`);
      const borrowRes = await API.get('/borrow', { params: { equipmentId: eqRes.data._id, status: 'Borrowed', limit: 1 } });
      if (!borrowRes.data.logs.length) {
        const overdueRes = await API.get('/borrow', { params: { equipmentId: eqRes.data._id, status: 'Overdue', limit: 1 } });
        if (!overdueRes.data.logs.length) return toast.error('No active borrow record found');
        setReturnLog(overdueRes.data.logs[0]);
      } else {
        setReturnLog(borrowRes.data.logs[0]);
      }
      setBarcodeReturn('');
    } catch {
      toast.error('Equipment not found');
    } finally {
      setBarcodeLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/borrow/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'borrow-history.csv';
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Borrow & Return</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} total records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setBorrowOpen(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> New Borrow
          </button>
        </div>
      </div>

      {/* Quick Barcode Return */}
      <div className="card p-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quick Return via Barcode</p>
        <div className="flex gap-2">
          <input
            className="input font-mono flex-1"
            placeholder="Scan or enter barcode to return..."
            value={barcodeReturn}
            onChange={e => setBarcodeReturn(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBarcodeReturn()}
          />
          <button onClick={handleBarcodeReturn} disabled={barcodeLoading} className="btn-primary whitespace-nowrap">
            {barcodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Return</>}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="input pl-9" placeholder="Search borrower, department..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input sm:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option>Borrowed</option>
            <option>Returned</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                {['Equipment', 'Borrower', 'Department', 'Qty', 'Date Borrowed', 'Expected Return', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" /></td>
                  ))}</tr>
                ))
              ) : !logs.length ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <ArrowLeftRight className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No borrow records</p>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {log.equipment?.image ? <img src={IMG_BASE + log.equipment.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400 m-2" />}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{log.equipment?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.borrowerName}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{log.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{log.quantityBorrowed}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{format(new Date(log.dateBorrowed), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={new Date(log.expectedReturn) < new Date() && log.status !== 'Returned' ? 'text-red-500 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                      {format(new Date(log.expectedReturn), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3">
                    {log.status !== 'Returned' && (
                      <button onClick={() => setReturnLog(log)} className="text-xs btn-secondary py-1.5">
                        <CheckCircle className="w-3 h-3" /> Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={borrowOpen} onClose={() => setBorrowOpen(false)} title="New Borrow Request" size="lg">
        <BorrowForm onSave={() => { setBorrowOpen(false); fetchLogs(); }} onClose={() => setBorrowOpen(false)} />
      </Modal>

      <Modal isOpen={!!returnLog} onClose={() => setReturnLog(null)} title="Process Return" size="md">
        {returnLog && <ReturnForm log={returnLog} onSave={() => { setReturnLog(null); fetchLogs(); }} onClose={() => setReturnLog(null)} />}
      </Modal>
    </div>
  );
}
