import api from './axiosInstance';

export const getSavedProviders = () => api.get('/users/saved');
export const saveProvider = (providerId) => api.post(`/users/saved/${providerId}`);
export const unsaveProvider = (providerId) => api.delete(`/users/saved/${providerId}`);
export const getAllUsers = (params) => api.get('/users', { params });
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const uploadImage = (formData) => api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
