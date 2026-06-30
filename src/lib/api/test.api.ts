import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { API_BASE_URL, USER_TOKEN_KEY } from '../api.index';

const serializeProfilePayload = (data: any) => {
  const formData = new FormData();

  // 1. Process text variables
  Object.keys(data).forEach((key) => {
    if (key !== 'photos') {
      if (key === 'interests' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    }
  });

  // 2. Process photos safely
  if (Array.isArray(data.photos)) {
    const existingUrls: string[] = [];

    data.photos.forEach((photoItem: any, index: number) => {
      if (!photoItem) return;

      const photo = typeof photoItem === 'string' ? photoItem : photoItem.url || photoItem.uri;
      
      if (!photo || typeof photo !== 'string') return;

      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        existingUrls.push(photo);
      } else {
        const filename = photo.split('/').pop() || `photo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('photos', {
          uri: photo,
          name: filename,
          type,
        } as any); 
      }
    });

    if (existingUrls.length > 0) {
      formData.append('photos', JSON.stringify(existingUrls));
    }
  }

  return formData;
};

export const testApi = {
  get: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  
  update: async (data: any) => {
    const formData = new FormData();

    // 1. Append text fields
    Object.keys(data).forEach((key) => {
      if (key !== 'photos') {
        if (key === 'interests' && Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, String(data[key]));
        }
      }
    });

    // 2. Append photos correctly for React Native
    if (Array.isArray(data.photos)) {
      data.photos.forEach((photo: any, index: number) => {
        if (typeof photo === 'string' && (photo.startsWith('http'))) {
            // It's a URL, send as string
            formData.append('photos', photo);
        } else {
            // It's a local file, create the object expected by RN's FormData
            const filename = photo.split('/').pop();
            formData.append('photos', {
                uri: photo,
                name: filename,
                type: 'image/jpeg', // Force jpeg for consistency
            } as any);
        }
      });
    }

    // 3. Send using Axios with correct headers
    // Axios handles the multipart boundary logic MUCH better than fetch
    return await api.patch('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Important: Tell axios not to transform the data, 
      // otherwise it tries to turn FormData into JSON
      transformRequest: (data) => data, 
    });
  },
};