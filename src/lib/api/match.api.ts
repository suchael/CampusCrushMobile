import api from '../api.index';

export const matchApi = {
  like: async (targetUserId: string) => {
    const res = await api.post(`/like/${targetUserId}`);
    return res.data;
  },
  getMatches: async () => {
    const res = await api.get('/matches');
    return res.data;
  },
};