import axios from 'axios';

function expired(status) {
  if (status === 401) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.assign('/login');
  }
}
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  const token = sessionStorage.getItem('token');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  expired(response.status);
  if (!response.ok) throw new Error(`Solicitud rechazada (${response.status})`);
  return response;
}
export const api = axios.create();
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  expired(error.response?.status);
  return Promise.reject(error);
});
