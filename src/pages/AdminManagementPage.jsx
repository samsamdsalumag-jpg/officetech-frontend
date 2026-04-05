import { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Trash2, Check } from 'lucide-react';

export default function AdminManagementPage() {
  const [pending, setPending] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        API.get('/auth/pending'),
        API.get('/auth/all'),
      ]);
      setPending(pendingRes.data.pendingAdmins || []);
      setAllAdmins(allRes.data.admins || []);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    setApproving(id);
    try {
      await API.put(`/auth/approve/${id}`);
      toast.success('Admin approved!');
      setPending(pending => pending.filter(a => a._id !== id));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  const deleteAdmin = async (id, email) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    setDeleting(id);
    try {
      await API.delete(`/auth/${id}`);
      toast.success('Admin deleted!');
      setAllAdmins(allAdmins => allAdmins.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deletion failed');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Admin Management</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pending Approvals ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Admins ({allAdmins.length})
        </button>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {pending.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No pending admin approvals.</p>
          ) : (
            <div className="space-y-3">
              {pending.map(admin => (
                <div key={admin._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{admin.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{admin.email}</p>
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    onClick={() => approve(admin._id)}
                    disabled={approving === admin._id}
                  >
                    <Check className="w-4 h-4" />
                    {approving === admin._id ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Admins Tab */}
      {activeTab === 'all' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {allAdmins.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No admins found.</p>
          ) : (
            <div className="space-y-3">
              {allAdmins.map(admin => (
                <div key={admin._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {admin.name}
                      {admin.isPrimary && (
                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">Primary</span>
                      )}
                      {!admin.isApproved && (
                        <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">Pending</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{admin.email}</p>
                  </div>
                  {!admin.isPrimary && (
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                      onClick={() => deleteAdmin(admin._id, admin.email)}
                      disabled={deleting === admin._id}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting === admin._id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
