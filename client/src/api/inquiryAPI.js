import api from './axiosInstance';

export const createInquiry = (data) => api.post('/inquiries', data);
export const getUserInquiries = () => api.get('/inquiries/user');
export const getProviderInquiries = (params) => api.get('/inquiries/provider', { params });
export const replyToInquiry = (id, message) => api.put(`/inquiries/${id}/reply`, { message });
export const updateInquiryStatus = (id, status) => api.patch(`/inquiries/${id}/status`, { status });
