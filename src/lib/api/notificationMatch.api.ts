import api from '../api.index';

export interface NotificationUser {
  id: string;
  name: string;
  college: string;
  photos: string[];
  age: number;
  genderIdentity: string;
  bio: string | null;
  major: string;
  year: string;
  relationshipGoal: string;
  interests: string[];
  studyPreferences: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  incoming: NotificationUser[];
  outgoing: NotificationUser[];
}

export const notificationMatchApi = {
  getNotifications: async (): Promise<NotificationsResponse> => {
    // Explicitly add the /notifications prefix
    const response = await api.get('/notifications');
    return response.data;
  },

  acceptRequest: async (targetUserId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/notifications/accept/${targetUserId}`);
    return response.data;
  },

  declineRequest: async (targetUserId: string): Promise<{ success: boolean }> => {
    const response = await api.post(`/notifications/decline/${targetUserId}`);
    return response.data;
  },

  cancelRequest: async (targetUserId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/notifications/cancel/${targetUserId}`);
    return response.data;
  },
};