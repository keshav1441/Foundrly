import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const api = {
  // Ideas
  getIdeas: (params = {}) => axios.get(`${API_BASE_URL}/ideas`, { params }),
  getIdea: (id) => axios.get(`${API_BASE_URL}/ideas/${id}`),
  getUserIdeas: (userId) => axios.get(`${API_BASE_URL}/ideas/user/${userId}`),
  createIdea: (data) => axios.post(`${API_BASE_URL}/ideas`, data),
  updateIdea: (id, data) => axios.put(`${API_BASE_URL}/ideas/${id}`, data),
  deleteIdea: (id) => axios.delete(`${API_BASE_URL}/ideas/${id}`),

  // Matches
  swipe: (ideaId, direction) =>
    axios.post(`${API_BASE_URL}/match/swipe`, { ideaId, direction }),
  getMatches: () => axios.get(`${API_BASE_URL}/match/matches`),
  getMatch: (id) => axios.get(`${API_BASE_URL}/match/matches/${id}`),

  // Chat
  getMessages: (matchId) =>
    axios.get(`${API_BASE_URL}/chat/${matchId}/messages`),
  sendMessage: (matchId, content) =>
    axios.post(`${API_BASE_URL}/chat/${matchId}/messages`, { content }),
  markMessagesRead: (matchId) =>
    axios.post(`${API_BASE_URL}/chat/${matchId}/messages/read`),

  // Memes
  getMemes: (params = {}) => axios.get(`${API_BASE_URL}/memes`, { params }),
  createMeme: (data) => axios.post(`${API_BASE_URL}/memes`, data),
  upvoteMeme: (id) => axios.post(`${API_BASE_URL}/memes/${id}/upvote`),
  getComments: (memeId) =>
    axios.get(`${API_BASE_URL}/memes/${memeId}/comments`),
  createComment: (memeId, content) =>
    axios.post(`${API_BASE_URL}/memes/${memeId}/comments`, { content }),

  // Users
  getUser: (id) => axios.get(`${API_BASE_URL}/users/${id}`),
  updateUser: (id, data) => axios.put(`${API_BASE_URL}/users/${id}`, data),
  getMe: () => axios.get(`${API_BASE_URL}/users/me`),

  // AI
  generateAndSave: (count = 5, userId) =>
    axios.post(`${API_BASE_URL}/ai/generate-and-save`, { count, userId }),

  // Requests
  createRequest: (ideaId, message) =>
    axios.post(`${API_BASE_URL}/requests`, { ideaId, message }),
  getRequests: () => axios.get(`${API_BASE_URL}/requests`),
  acceptRequest: (requestId) =>
    axios.post(`${API_BASE_URL}/requests/${requestId}/accept`),
  rejectRequest: (requestId) =>
    axios.post(`${API_BASE_URL}/requests/${requestId}/reject`),

  // Notifications
  getNotifications: () => axios.get(`${API_BASE_URL}/notifications`),
  markNotificationRead: (id, type) =>
    axios.post(`${API_BASE_URL}/notifications/${id}/read`, { type }),
  deleteNotification: (id, type) =>
    axios.delete(`${API_BASE_URL}/notifications/${id}`, { data: { type } }),
  markAllNotificationsRead: () =>
    axios.post(`${API_BASE_URL}/notifications/read-all`),
  deleteAllNotifications: () =>
    axios.delete(`${API_BASE_URL}/notifications/all`),
};
