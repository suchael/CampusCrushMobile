// src/api/discoveryApi.ts
import api from '../api.index';
import { FilterState } from '../../utils/FilterModal';


export const discoveryApi = {
  // Pass the filters object as params
  getUsers: async (filters: FilterState) => {
    const res = await api.get('/discover', {
      params: {
        maxAge: filters.ageRange[1], // Extract max age
        gender: filters.gender.join(','),
        goals: filters.goals.join(','),
        interests: filters.interests.join(','),
        year: filters.year.join(','),
      },
    });
    return res.data;
  },
};