import api from "../api.index";

export interface CreateEventDTO {
  title: string;
  category: string;
  date: string; // Unified ISO timestamp string
  location: string;
}

export interface UserCard {
  id: string;
  userId: string;
  name: string;
  createdByYou: boolean;
}

export interface ExternalEventDate {
  when: string;
  time: string;
}

export interface CampusEvent {
  id: string;
  schoolQueried: string;
  title: string;
  category: string;
  date: string | ExternalEventDate; // Handles internal ISO strings or external date objects
  location: string;
  image: string;
  attendeeCount?: number;
  creator?: UserCard;
  link?: string;
  mapLink?: string;
  rating?: number;
}

export interface Explore_Events_Response {
  success: boolean;
  events: CampusEvent[];
  attendanceMap?: Record<string, boolean>;
}

export const explore_Events_Api = {
  /**
   * Fetch internal campus events from backend filtered by category
   */
  getEvents: async (category: string): Promise<Explore_Events_Response> => {
    const params = category !== "All" ? { category } : {};
    const res = await api.get("/events", { params });
    return res.data;
  },

  /**
   * Fetch live external school events via SerpApi
   */
  getExternalEvents: async (school: string = "Stanford University"): Promise<Explore_Events_Response> => {
    const res = await api.get("/events/external", {
      params: { school },
    });
    return res.data;
  },

  /**
   * Publish a brand new event record to the server directory
   */
  createEvent: async (eventData: CreateEventDTO): Promise<{ success: boolean; event: CampusEvent }> => {
    const res = await api.post("/events", eventData);
    return res.data;
  },

  /**
   * Perform an atomic toggle operation to join or leave an event
   */
  toggleAttendance: async (eventId: string): Promise<{ success: boolean; isGoing: boolean; attendeeCount: number }> => {
    const res = await api.post(`/events/${eventId}/toggle-attendance`);
    return res.data;
  },
};