import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download, Edit2, Trash2, Package, QrCode, Camera, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const CONDITIONS = ['Good', 'Damaged', 'Maintenance'];
const IMG_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function EquipmentForm({ initial, categories, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', category: '', barcode: '', quantity: 1, availableStock: 1,
    location: 'Main Office', condition: 'Good', description: '', brand: '', model: '',
    serialNumber: '', lowStockThreshold: 2,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image ? IMG_BASE + initial.image : null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && k !== '_id' && k !== '__v' && k !== 'image' && k !== 'category') {
          fd.append(k, v);
        }
      });
      fd.append('category', form.category?._id || form.category);
      if (imageFile) fd.append('image', imageFile);

      if (initial?._id) {
        await API.put(`/equipment/${initial._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Equipment updated');
      } else {
        await API.post('/equipment', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Equipment added');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Image upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-600">
          {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-slate-300" />}
        </div>
        <div>
          <label className="btn-secondary cursor-pointer text-sm">
            <Camera className="w-4 h-4" /> Upload Image
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Equipment Name *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Dell Laptop XPS 15" />
        </div>

        <div>
          <label className="label">Category *</label>
          <select className="input" value={form.category?._id || form.category} onChange={e => set('category', e.target.value)} required>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Condition</label>
          <select className="input" value={form.condition} onChange={e => set('condition', e.target.value)}>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Barcode (auto-generated if empty)</label>
          <div className="flex gap-2">
            <input className="input" value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Leave blank to auto-generate" />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Main Office" />
        </div>

        <div>
          <label className="label">Quantity *</label>
          <input type="number" min="0" className="input" value={form.quantity} onChange={e => { const v = parseInt(e.target.value); set('quantity', v); if (!initial) set('availableStock', v); }} required />
        </div>

        <div>
          <label className="label">Available Stock *</label>
          <input type="number" min="0" max={form.quantity} className="input" value={form.availableStock} onChange={e => set('availableStock', parseInt(e.target.value))} required />
        </div>

        <div>
          <label className="label">Brand</label>
          <input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Dell" />
        </div>

        <div>
          <label className="label">Model</label>
          <input className="input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. XPS 15 9500" />
        </div>

        <div>
          <label className="label">Serial Number</label>
          <input className="input" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} placeholder="Optional" />
        </div>

        <div>
          <label className="label">Low Stock Threshold</label>
          <input type="number" min="0" className="input" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', parseInt(e.target.value))} />
        </div>

        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea className="input resize-none h-20" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description..." />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {initial ? 'Update Equipment' : 'Add Equipment'}
        </button>
      </div>
    </form>
  );
}

function BarcodeModal({ equipment, onClose }) {
  const [barcodeData, setBarcodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.post(`/equipment/${equipment._id}/generate-barcode`)
      .then(res => setBarcodeData(res.data))
      .finally(() => setLoading(false));
  }, [equipment._id]);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><body style="text-align:center;font-family:sans-serif;padding:20px">
        <h3>${equipment.name}</h3>
        <img src="${barcodeData.barcodeImage}" style="width:200px" />
        <p style="font-family:monospace;font-size:12px">${barcodeData.barcode}</p>
      </body></html>
    `);
    win.print();
  };

  return (
    <div className="p-6 text-center">
      {loading ? <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /> : (
        <>
          <img src={barcodeData?.barcodeImage} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl" />
          <p className="font-mono text-sm text-slate-600 dark:text-slate-400 mt-3">{barcodeData?.barcode}</p>
          <p className="text-xs text-slate-500 mt-1">{equipment.name}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={onClose} className="btn-secondary">Close</button>
            <button onClick={handlePrint} className="btn-primary">Print</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [barcodeItem, setBarcodeItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search: debouncedSearch };
      if (categoryFilter) params.category = categoryFilter;
      if (conditionFilter) params.condition = conditionFilter;
      if (lowStockOnly) params.lowStock = 'true';
      const res = await API.get('/equipment', { params });
      setEquipment(res.data.equipment);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryFilter, conditionFilter, lowStockOnly]);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  useEffect(() => {
    API.get('/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, categoryFilter, conditionFilter, lowStockOnly]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/equipment/${deleteConfirm._id}`);
      toast.success('Equipment deleted');
      setDeleteConfirm(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/equipment/export/csv', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory.csv';
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  const conditionBadge = (c) => {
    const map = { Good: 'badge-green', Damaged: 'badge-red', Maintenance: 'badge-yellow' };
    return <span className={`badge ${map[c] || 'badge-gray'}`}>{c}</span>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} total equipment items</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search equipment, barcode, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input sm:w-48" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input sm:w-40" value={conditionFilter} onChange={e => setConditionFilter(e.target.value)}>
            <option value="">All Conditions</option>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setLowStockOnly(v => !v)}
            className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 ${lowStockOnly ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <AlertTriangle className="w-4 h-4" /> Low Stock
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                {['Equipment', 'Category', 'Barcode', 'Stock', 'Location', 'Condition', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : !equipment.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No equipment found</p>
                    <p className="text-sm text-slate-400 mt-1">Add your first equipment to get started</p>
                  </td>
                </tr>
              ) : equipment.map(item => (
                <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image
                          ? <img src={IMG_BASE + item.image} alt="" className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">{item.name}</p>
                        {item.brand && <p className="text-xs text-slate-400">{item.brand} {item.model}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.category && (
                      <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: item.category.color + '20', color: item.category.color }}>
                        {item.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{item.barcode || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold text-sm ${item.availableStock === 0 ? 'text-red-500' : item.availableStock <= item.lowStockThreshold ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {item.availableStock}
                      </span>
                      <span className="text-slate-400 text-xs">/ {item.quantity}</span>
                      {item.availableStock <= item.lowStockThreshold && item.availableStock > 0 && (
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{item.location}</td>
                  <td className="px-4 py-3">{conditionBadge(item.condition)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setBarcodeItem(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors" title="Barcode">
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setEditItem(item); setFormOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(item)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {pages} · {total} items</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pages} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={formOpen} onClose={() => { setFormOpen(false); setEditItem(null); }} title={editItem ? 'Edit Equipment' : 'Add New Equipment'} size="lg">
        <EquipmentForm
          initial={editItem}
          categories={categories}
          onSave={() => { setFormOpen(false); setEditItem(null); fetchEquipment(); }}
          onClose={() => { setFormOpen(false); setEditItem(null); }}
        />
      </Modal>

      {/* Barcode Modal */}
      <Modal isOpen={!!barcodeItem} onClose={() => setBarcodeItem(null)} title="Equipment Barcode" size="sm">
        {barcodeItem && <BarcodeModal equipment={barcodeItem} onClose={() => setBarcodeItem(null)} />}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
