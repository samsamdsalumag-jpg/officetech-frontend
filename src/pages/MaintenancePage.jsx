import { useState, useEffect, useCallback } from 'react';
import { Plus, Wrench, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, Package } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { format } from 'date-fns';

const IMG_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

function MaintenanceForm({ onSave, onClose }) {
  const [step, setStep] = useState(1);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    issueDescription: '', priority: 'Medium', technician: '',
  });

  const searchEquipment = async (q) => {
    if (!q) return setEquipmentList([]);
    const res = await API.get('/equipment', { params: { search: q, limit: 5 } });
    setEquipmentList(res.data.equipment);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/maintenance', { equipmentId: equipment._id, ...form });
      toast.success('Maintenance reported');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) return (
    <div className="p-6">
      <p className="font-medium text-slate-900 dark:text-white mb-3">Select Equipment</p>
      <input className="input" placeholder="Search equipment..." value={equipmentSearch} onChange={e => { setEquipmentSearch(e.target.value); searchEquipment(e.target.value); }} />
      {equipmentList.length > 0 && (
        <div className="mt-2 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
          {equipmentList.map(e => (
            <button key={e._id} type="button" onClick={() => { setEquipment(e); setStep(2); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                {e.image ? <img src={IMG_BASE + e.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400 m-2" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{e.name}</p>
                <p className="text-xs text-slate-500">Condition: {e.condition} · {e.location}</p>
              </div>
              {e.isUnderMaintenance && <span className="ml-auto badge badge-yellow text-xs">Active</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
        <Wrench className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{equipment.name}</p>
          <p className="text-xs text-slate-500">{equipment.location}</p>
        </div>
        <button type="button" onClick={() => setStep(1)} className="ml-auto text-xs text-slate-500">Change</button>
      </div>

      <div>
        <label className="label">Issue Description *</label>
        <textarea className="input resize-none h-24" value={form.issueDescription} onChange={e => setForm(f => ({ ...f, issueDescription: e.target.value }))} required placeholder="Describe the issue..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Technician (Optional)</label>
          <input className="input" value={form.technician} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} placeholder="Assigned technician" />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Report Maintenance
        </button>
      </div>
    </form>
  );
}

function UpdateForm({ record, onSave, onClose }) {
  const [form, setForm] = useState({
    status: record.status,
    cost: record.cost || 0,
    resolution: record.resolution || '',
    technician: record.technician || '',
    dateStarted: record.dateStarted ? record.dateStarted.split('T')[0] : '',
    dateCompleted: record.dateCompleted ? record.dateCompleted.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/maintenance/${record._id}`, form);
      toast.success('Maintenance updated');
      onSave();
    } catch (err) {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Repair Cost ($)</label>
          <input type="number" min="0" step="0.01" className="input" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: parseFloat(e.target.value) }))} />
        </div>
        <div>
          <label className="label">Technician</label>
          <input className="input" value={form.technician} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} />
        </div>
        <div>
          <label className="label">Date Started</label>
          <input type="date" className="input" value={form.dateStarted} onChange={e => setForm(f => ({ ...f, dateStarted: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Date Completed</label>
          <input type="date" className="input" value={form.dateCompleted} onChange={e => setForm(f => ({ ...f, dateCompleted: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="label">Resolution Notes</label>
          <textarea className="input resize-none h-20" value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))} placeholder="How was the issue resolved?" />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update
        </button>
      </div>
    </form>
  );
}

const priorityBadge = (p) => {
  const map = { Low: 'badge-green', Medium: 'badge-blue', High: 'badge-yellow', Critical: 'badge-red' };
  return <span className={`badge ${map[p] || 'badge-gray'}`}>{p}</span>;
};
const statusBadge = (s) => {
  const map = { Pending: 'badge-yellow', 'In Progress': 'badge-blue', Completed: 'badge-green', Cancelled: 'badge-gray' };
  return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>;
};

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await API.get('/maintenance', { params });
      setRecords(res.data.records);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/maintenance/${deleteConfirm._id}`);
      toast.success('Record deleted');
      setDeleteConfirm(null);
      fetchRecords();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} maintenance records</p>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search maintenance records..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="input pl-9 w-full"
            />
          </div>
          <select className="input sm:w-48" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {['Pending', 'In Progress', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                {['Equipment', 'Issue', 'Priority', 'Status', 'Cost', 'Technician', 'Reported', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" /></td>)}</tr>
                ))
              ) : !records.length ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No maintenance records</p>
                  </td>
                </tr>
              ) : records.map(record => (
                <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {record.equipment?.image ? <img src={IMG_BASE + record.equipment.image} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-slate-400 m-2" />}
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{record.equipment?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{record.issueDescription}</p>
                  </td>
                  <td className="px-4 py-3">{priorityBadge(record.priority)}</td>
                  <td className="px-4 py-3">{statusBadge(record.status)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">${record.cost?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.technician || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{format(new Date(record.dateReported), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditRecord(record)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(record)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title="Report Maintenance Issue" size="lg">
        <MaintenanceForm onSave={() => { setFormOpen(false); fetchRecords(); }} onClose={() => setFormOpen(false)} />
      </Modal>

      <Modal isOpen={!!editRecord} onClose={() => setEditRecord(null)} title="Update Maintenance" size="md">
        {editRecord && <UpdateForm record={editRecord} onSave={() => { setEditRecord(null); fetchRecords(); }} onClose={() => setEditRecord(null)} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message={`Delete this maintenance record for "${deleteConfirm?.equipment?.name}"?`}
        loading={deleting}
      />
    </div>
  );
}
