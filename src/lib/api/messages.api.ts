import api from '../api.index';

export interface ParticipantProfile {
  id: string;
  name: string;
  photo: string;
  photos?: string[];
  college?: string;
}

export interface ConversationItem {
  id: string; 
  isOnline: boolean;
  isTyping: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  profile: ParticipantProfile;
}

export interface ConversationsResponse {
  conversations: ConversationItem[];
}

export const messagesApi = {
  getConversations: async (): Promise<ConversationsResponse> => {
    const res = await api.get('/messages/conversations');
    return res.data.data; 
  },

  getMessages: async (matchId: string) => {
    const res = await api.get(`/messages/room/${matchId}`);
    return res.data.data;
  },

  // 🚀 NEW: Processes local device files (voice recordings/images) through the Cloudinary bridge pipeline
  uploadMedia: async (localUri: string, fileType: 'image' | 'video' | 'raw'): Promise<string> => {
    const formData = new FormData();
    
    // Construct the file upload body payload object
    formData.append('media', {
      uri: localUri,
      name: fileType === 'raw' ? 'voice_note.m4a' : 'upload.jpg',
      type: fileType === 'raw' ? 'audio/m4a' : 'image/jpeg',
    } as any);
    
    formData.append('fileType', fileType);

    const res = await api.post('/messages/media-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.url; // Returns the global secure streaming https link
  }
};