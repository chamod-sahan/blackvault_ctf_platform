import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const externalApi = {
  getCountries: () => axios.get(process.env.NEXT_PUBLIC_COUNTRIES_API || 'https://restcountries.com/v3.1/all?fields=name,cca2,flags'),
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  getUser: (id: string) => api.get(`/users/${id}`),
  getUsers: () => api.get('/users'),
  getLeaderboard: (type?: string, country?: string) =>
    api.get(`/users/leaderboard/${type || 'users'}`, { params: { country } }),
  getStats: () => api.get('/users/stats'),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

export const challengeApi = {
  getChallenges: (params?: { category?: string; difficulty?: string }) =>
    api.get('/challenges', { params }),
  getChallenge: (id: string) => api.get(`/challenges/${id}`),
  getCategories: () => api.get('/challenges/categories'),
  submitFlag: (challengeId: string, flag: string) =>
    api.post('/challenges/submit', { challengeId, flag }),
  createChallenge: (data: any) => api.post('/challenges', data),
  updateChallenge: (id: string, data: any) => api.put(`/challenges/${id}`, data),
  deleteChallenge: (id: string) => api.delete(`/challenges/${id}`),
  uploadAttachment: (formData: FormData) =>
    api.post('/challenges/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const educationApi = {
  // Paths (Guided)
  getPaths: () => api.get('/education/paths'),
  createPath: (data: any) => api.post('/education/paths', data),
  deletePath: (id: string) => api.delete(`/education/paths/${id}`),

  // Path Modules
  getPathModules: (pathId: string) => api.get(`/education/paths/${pathId}/modules`),
  createPathModule: (data: any) => api.post('/education/path-modules', data),
  updatePathModule: (id: string, data: any) => api.put(`/education/path-modules/${id}`, data),
  deletePathModule: (id: string) => api.delete(`/education/path-modules/${id}`),

  // Path Questions
  createPathQuestion: (data: any) => api.post('/education/path-questions', data),
  updatePathQuestion: (id: string, data: any) => api.put(`/education/path-questions/${id}`, data),
  deletePathQuestion: (id: string) => api.delete(`/education/path-questions/${id}`),

  // Academy (Standalone) ---
  getAcademyModules: () => api.get('/education/academy/modules'),
  createAcademyModule: (data: any) => api.post('/education/academy/modules', data),
  updateAcademyModule: (id: string, data: any) => api.put(`/education/academy/modules/${id}`, data),
  deleteAcademyModule: (id: string) => api.delete(`/education/academy/modules/${id}`),

  // Questions
  createAcademyQuestion: (data: any) => api.post('/education/academy/questions', data),

  uploadImage: (formData: FormData) => api.post('/education/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const ctfApi = {
  getEvents: () => api.get('/ctf'),
  createEvent: (data: any) =>
    data instanceof FormData
      ? api.post('/ctf', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.post('/ctf', data),
  updateEvent: (id: string, data: any) =>
    data instanceof FormData
      ? api.put(`/ctf/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : api.put(`/ctf/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/ctf/${id}`),
  uploadBanner: (formData: FormData) =>
    api.post('/ctf/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  register: (eventId: string, data: { type: 'SOLO' | 'TEAM'; teamId?: string }) =>
    api.post(`/ctf/${eventId}/register`, data),
  getRegistrationStatus: (eventId: string) =>
    api.get(`/ctf/${eventId}/registration-status`),
};

export const submissionApi = {
  getHistory: () => api.get('/submissions/history'),
  getSolves: () => api.get('/submissions/solves'),
  getAllSubmissions: (page?: number) =>
    api.get('/submissions/all', { params: { page } }),
};

export const adminApi = {
  getLogs: (page?: number) => api.get('/admin/logs', { params: { page } }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings: any) => api.put('/admin/settings', { settings }),
};

export const teamApi = {
  getTeams: () => api.get('/teams'),
  getTeam: (id: string) => api.get(`/teams/${id}`),
  getMyTeam: () => api.get('/teams/my'),
  createTeam: (name: string) => api.post('/teams', { name }),
  joinTeam: (teamId: string) => api.post(`/teams/join`, { teamId }),
  leaveTeam: () => api.post('/teams/leave'),
};

export const globalApi = {
  search: (query: string) => api.get('/challenges', { params: { search: query } }),
};

export default api;
