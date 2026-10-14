import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function RequireAdmin({ children }) {
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    if (!sessionStorage.getItem('token')) {
      setStatus('login');
      return;
    }
    apiFetch(`${import.meta.env.VITE_API_URL}/api/auth/me`)
      .then(response => response.json())
      .then(({ docente }) => {
        if (active) {
          sessionStorage.setItem('usuario', JSON.stringify(docente));
          setStatus(['admin', 'administrador'].includes(docente.rol.trim().toLowerCase()) ? 'allowed' : 'forbidden');
        }
      }).catch(() => { if (active) setStatus('login'); });
    return () => { active = false; };
  }, []);
  if (status === 'loading') return <p>Verificando sesión…</p>;
  if (status === 'login') return <Navigate to="/login" replace />;
  if (status === 'forbidden') return <p>No tienes permisos de administrador.</p>;
  return children;
}
