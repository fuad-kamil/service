import api from './axiosInstance';

export const getProviders = (params) => api.get('/providers', { params });
export const getProvider = (slug) => api.get(`/providers/${slug}`);
export const createProvider = (data) => api.post('/providers', data);
export const updateProvider = (id, data) => api.put(`/providers/${id}`, data);
export const deleteProvider = (id) => api.delete(`/providers/${id}`);
export const verifyProvider = (id, verified) => api.patch(`/providers/${id}/verify`, { verified });
export const updateProviderStatus = (id, status) => api.patch(`/providers/${id}/status`, { status });
export const getMyProvider = () => api.get('/providers/me');
export const getProviderAnalytics = (id) => api.get(`/providers/${id}/analytics`);
