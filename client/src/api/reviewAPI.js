import api from './axiosInstance';

export const getProviderReviews = (providerId) => api.get(`/reviews/provider/${providerId}`);
export const createReview = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
