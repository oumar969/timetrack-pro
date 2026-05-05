import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

// Clock
export const clockIn = (name, code) => api.post('/clock/in', { name, code });
export const clockOut = (name, code) => api.post('/clock/out', { name, code });
export const getClockStatus = (name) => api.get(`/clock/status/${encodeURIComponent(name)}`);

// Employees (admin)
export const getEmployees = () => api.get('/employees');
export const createEmployee = (name, code) => api.post('/employees', { name, code });
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Sessions & analytics (admin)
export const getSessions = (params) => api.get('/sessions', { params });
export const getTodaySessions = () => api.get('/sessions/today');
export const getWeekAnalytics = () => api.get('/analytics/week');

export default api;
