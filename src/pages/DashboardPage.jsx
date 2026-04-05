import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, ArrowLeftRight, AlertTriangle, Wrench, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import API from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ title, value, subtitle, icon: Icon, color, loading }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const shadowColors = {
    blue: 'shadow-blue-500/20',
    emerald: 'shadow-emerald-500/20',
    amber: 'shadow-amber-500/20',
    red: 'shadow-red-500/20',
    purple: 'shadow-purple-500/20',
  };

  if (loading) return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="card p-6 hover:shadow-xl hover:-translate-y-1 smooth-transition group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 smooth-transition" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">{title}</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:${shadowColors[color]} smooth-transition shadow-lg ${shadowColors[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

const statusIcon = {
  Borrowed: <ArrowLeftRight className="w-3 h-3" />,
  Returned: <CheckCircle className="w-3 h-3" />,
  Overdue: <Clock className="w-3 h-3" />,
};
const statusColor = {
  Borrowed: 'badge-blue',
  Returned: 'badge-green',
  Overdue: 'badge-red',
};

export default function DashboardPage() {
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when location changes (user navigates back to dashboard)
  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [location.pathname]);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = data?.stats || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="animate-fadeInUp">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your inventory at a glance</p>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 animate-fadeInUp">
        <div style={{ animationDelay: '0.05s' }}>
          <StatCard title="Total Equipment" value={loading ? '—' : stats.totalEquipment} subtitle={`${stats.totalItems || 0} total units`} icon={Package} color="blue" loading={loading} />
        </div>
        <div style={{ animationDelay: '0.1s' }}>
          <StatCard title="Available Stock" value={loading ? '—' : stats.availableItems} subtitle="Units available" icon={TrendingUp} color="emerald" loading={loading} />
        </div>
        <div style={{ animationDelay: '0.15s' }}>
          <StatCard title="Borrowed Items" value={loading ? '—' : stats.borrowedCount} subtitle={`${stats.overdueCount || 0} overdue`} icon={ArrowLeftRight} color="amber" loading={loading} />
        </div>
        <div style={{ animationDelay: '0.2s' }}>
          <StatCard title="Under Maintenance" value={loading ? '—' : stats.maintenanceCount} subtitle={`${stats.lowStockItems || 0} low stock`} icon={Wrench} color="red" loading={loading} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeInUp">
        {/* Category Bar Chart */}
        <div className="card p-6 hover:shadow-lg smooth-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Equipment by Category</h2>
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
          </div>
          {loading ? (
            <div className="h-48 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.categoryBreakdown || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', backgroundColor: '#1e293b', color: '#e2e8f0' }} 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Borrow Line Chart */}
        <div className="card p-6 hover:shadow-lg smooth-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Monthly Borrow Activity</h2>
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
          </div>
          {loading ? (
            <div className="h-48 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data?.monthlyBorrows || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', backgroundColor: '#1e293b', color: '#e2e8f0' }} 
                  cursor={{ stroke: 'rgba(99, 102, 241, 0.3)' }}
                />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6 hover:shadow-lg smooth-transition animate-fadeInUp">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            Recent Activity
          </h2>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : !data?.recentActivity?.length ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-2xl mb-3">
              <ArrowLeftRight className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No recent activity yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Activities will appear here as they happen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((activity, idx) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 smooth-transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50" style={{ animationDelay: `${idx * 0.05}s` }}>

                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {activity.image ? (
                    <img src={activity.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {activity.equipment}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.type === 'borrow' ? 'Borrowed' : 'Returned'} by {activity.borrower} · {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                  </p>
                </div>
                <span className={`${statusColor[activity.status]} badge flex items-center gap-1`}>
                  {statusIcon[activity.status]}
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
