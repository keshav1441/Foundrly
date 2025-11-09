import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const api = {
  // Ideas
  getIdeas: (params = {}) => axios.get(`${API_BASE_URL}/ideas`, { params }),
  getIdea: (id) => axios.get(`${API_BASE_URL}/ideas/${id}`),
  getUserIdeas: (userId) => axios.get(`${API_BASE_URL}/ideas/user/${userId}`),
  createIdea: (data) => axios.post(`${API_BASE_URL}/ideas`, data),

  // Matches
  swipe: (ideaId, direction) => axios.post(`${API_BASE_URL}/match/swipe`, { ideaId, direction }),
  getMatches: () => axios.get(`${API_BASE_URL}/match/matches`),
  getMatch: (id) => axios.get(`${API_BASE_URL}/match/matches/${id}`),

  // Chat
  getMessages: (matchId) => axios.get(`${API_BASE_URL}/chat/${matchId}/messages`),
  sendMessage: (matchId, content) => axios.post(`${API_BASE_URL}/chat/${matchId}/messages`, { content }),

  // Memes
  getMemes: (params = {}) => axios.get(`${API_BASE_URL}/memes`, { params }),
  createMeme: (data) => axios.post(`${API_BASE_URL}/memes`, data),
  upvoteMeme: (id) => axios.post(`${API_BASE_URL}/memes/${id}/upvote`),

  // Users
  getUser: (id) => axios.get(`${API_BASE_URL}/users/${id}`),
  updateUser: (id, data) => axios.put(`${API_BASE_URL}/users/${id}`, data),
  getMe: () => axios.get(`${API_BASE_URL}/users/me`),

  // AI
  generateIdeas: (count = 5) => axios.post(`${API_BASE_URL}/ai/generate`, { count }),
  generateAndSave: (count = 5, userId) => axios.post(`${API_BASE_URL}/ai/generate-and-save`, { count, userId }),
  pitchPolish: (idea) => axios.post(`${API_BASE_URL}/ai/pitchpolish`, { idea }),
};


