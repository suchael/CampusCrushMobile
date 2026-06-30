import api from '../api.index';

// Helper function to build native Multipart Form Data out of structural objects
const serializeProfilePayload = (data: any) => {
  const formData = new FormData();

  // 1. Process standard fields and text variables
  Object.keys(data).forEach((key) => {
    if (key !== 'photos') {
      if (key === 'interests' && Array.isArray(data[key])) {
        // Stringify arrays so the backend's JSON.parse() catches them flawlessly
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    }
  });

  // 2. Process binary files vs existing CDN strings
  if (Array.isArray(data.photos)) {
    const existingUrls: string[] = [];

    data.photos.forEach((photo: string, index: number) => {
      if (!photo) return;

      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        // Retain existing Cloudinary URLs for profile updates
        existingUrls.push(photo);
      } else {
        // Package local device URIs into actual binary file slots
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

    // If updating existing photos, append them to the form layout text field
    if (existingUrls.length > 0) {
      formData.append('photos', JSON.stringify(existingUrls));
    }
  }

  return formData;
};

export const profileApi = {
  get: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  create: async (data: any) => {
    const payload = serializeProfilePayload(data);
    const res = await api.post('/profile', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (data: any) => {
    const payload = serializeProfilePayload(data);
    const res = await api.patch('/profile', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getById: async (userId: string) => {
    const res = await api.get(`/profile/${userId}`);
    return res.data;
  },
};