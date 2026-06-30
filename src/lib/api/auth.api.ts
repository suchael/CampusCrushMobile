import api from '../api.index';

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password });
    return res.data;
  },
  verifyEmail: async (email: string, otp: string) => {
    const res = await api.post('/auth/verify-email', { email, otp });
    return res.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  // Integrated Forgot Password Operations
  sendOtp: async (email: string) => {
    const res = await api.post('/auth/forgot-password/send-otp', { email });
    return res.data;
  },
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await api.post('/auth/forgot-password/reset', { email, otp, newPassword });
    return res.data;
  },
  deleteAccount: async () => {
    const res = await api.delete('/auth/delete');
    return res.data;
  },
};