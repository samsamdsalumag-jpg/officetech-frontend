import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback((expired = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
    if (expired) toast.error('Session expired. Please log in again.');
  }, []);

  useEffect(() => {
    const handler = (e) => logout(e.detail?.expired);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res => {
          setAdmin(res.data);
          localStorage.setItem('admin', JSON.stringify(res.data));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('admin', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ admin, setAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
