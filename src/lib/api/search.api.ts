import api from '../api.index';

export interface SearchParams {
  name?: string;
  random?: string; // true or false as string, since query params are strings
}

export const searchApi = {
  getUsers: async (params: SearchParams) => {
    const res = await api.get('/search', { params });
    return res.data;
  },
};