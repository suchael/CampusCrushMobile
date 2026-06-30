import api from '../api.index';

export const settingsApi = {
  get: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  update: async (data: any) => {
    const res = await api.patch('/settings', data);
    return res.data;
  },
};