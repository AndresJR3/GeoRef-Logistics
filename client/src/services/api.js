import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Places
export const placesService = {
  getAll: (userId) => api.get(`/places?userId=${userId}`),
  getById: (id) => api.get(`/places/${id}`),
  create: (data) => api.post('/places', data),
  update: (id, data) => api.put(`/places/${id}`, data),
  delete: (id) => api.delete(`/places/${id}`),
  getHistory: (id) => api.get(`/places/${id}/history`),
  getAllHistory: () => api.get('/places/history/all/all'),
};

// Polygons
export const polygonsService = {
  getAll: (userId) => api.get(`/polygons?userId=${userId}`),
  create: (data) => api.post('/polygons', data),
};

// Clients
export const clientsService = {
  getAll: () => api.get('/clients'),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Deliveries
export const deliveriesService = {
  getAll: () => api.get('/deliveries'),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  delete: (id) => api.delete(`/deliveries/${id}`),
};

// Drivers
export const driversService = {
  getAll: () => api.get('/drivers'),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
};

export default api;
