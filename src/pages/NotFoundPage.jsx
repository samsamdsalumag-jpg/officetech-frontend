import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-3">404</h1>
        <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Page Not Found</p>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary inline-flex mx-auto">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
