import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ArrowLeftRight, Wrench, BarChart3,
  ChevronLeft, ChevronRight, Sun, Moon, LogOut, Menu, X,
  Cpu, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const navItemsBase = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/borrow', icon: ArrowLeftRight, label: 'Borrow & Return' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Add Admin Management nav for primary admin
  const navItems = [
    ...navItemsBase,
    ...(admin?.isPrimary ? [{ to: '/admin-management', icon: Cpu, label: 'Admin Management' }] : []),
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-700 smooth-transition ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-110 smooth-transition">
          <Cpu className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-none">LOOCKAGE</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Inventory Pro</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl smooth-transition group
              ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/10 dark:shadow-blue-500/20 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white hover:shadow-sm'
              }
              ${collapsed && !isMobile ? 'justify-center' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 smooth-transition" />
            {(!collapsed || isMobile) && (
              <span className="font-medium text-sm">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Admin section */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700">
        <div className={`flex items-center gap-3 group ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-110 smooth-transition">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{admin?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{admin?.email}</p>
            </div>
          )}
          {(!collapsed || isMobile) && (
            <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 hover:scale-110 smooth-transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 smooth-transition shadow-sm ${collapsed ? 'w-16' : 'w-60'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%-12px)] z-10 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 smooth-transition shadow-md hover:shadow-lg"
          style={{ left: collapsed ? 52 : 228 }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeInUp">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-white dark:bg-slate-800 h-full shadow-2xl dark:shadow-2xl dark:shadow-slate-900/50">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:scale-110 smooth-transition">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 h-14 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between px-4 gap-4 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:scale-110 smooth-transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:scale-110 smooth-transition"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:scale-110 smooth-transition" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
