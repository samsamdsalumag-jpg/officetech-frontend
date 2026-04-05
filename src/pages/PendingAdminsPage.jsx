import { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function PendingAdminsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auth/pending');
      setPending(res.data);
    } catch (err) {
      toast.error('Failed to fetch pending admins');
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Pending Admin Approvals</h2>
      {loading ? (
        <div>Loading...</div>
      ) : pending.length === 0 ? (
        <div className="text-green-600">No pending admins.</div>
      ) : (
        <ul className="space-y-4">
          {pending.map(admin => (
            <li key={admin._id} className="flex items-center justify-between border-b pb-2">
              <div>
                <div className="font-semibold">{admin.name}</div>
                <div className="text-sm text-gray-600">{admin.email}</div>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={() => approve(admin._id)}
                disabled={approving === admin._id}
              >
                {approving === admin._id ? 'Approving...' : 'Approve'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
