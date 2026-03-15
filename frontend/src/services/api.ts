import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンを自動追加）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),
  profile: () => apiClient.get('/auth/profile'),
};

// Users API
export const usersApi = {
  getAll: () => apiClient.get('/users'),
  getOne: (id: number) => apiClient.get(`/users/${id}`),
  getDashboardData: () => apiClient.get('/users/dashboard_data'),
  create: (data: any) => apiClient.post('/users', data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
};

// Companies API
export const companiesApi = {
  getAll: () => apiClient.get('/companies'),
  create: (name: string) => apiClient.post('/companies', { name }),
};

// Questions API
export const questionsApi = {
  getAll: () => apiClient.get('/questions'),
  getCommon: () => apiClient.get('/questions/common'),
  getGenres: () => apiClient.get('/questions/genres'),
  getQuiz: (genre: string, count: number) =>
    apiClient.get('/questions/quiz-start', { params: { genre, count } }),
  create: (data: any) => apiClient.post('/questions', data),
  update: (id: number, data: any) => apiClient.patch(`/questions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/questions/${id}`),
  copy: (id: number) => apiClient.post(`/questions/${id}/copy`, {}),
  upload: (file: FormData) => apiClient.post('/questions/upload', file, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Learning Logs API
export const learningLogsApi = {
  getAll: () => apiClient.get('/learning-logs'),
  getAnalysisData: () => apiClient.get('/learning-logs/analysis_data'),
  create: (results: any[]) => apiClient.post('/learning-logs', results),
};

// User Results & Analysis API
export const userApi = {
  getResults: () => apiClient.get('/user/my_results'),
  getAnalysis: () => apiClient.get('/users/analysis_data'),
  getDashboardData: () => apiClient.get('/users/dashboard_data'),

  // 学習パターン診断API
  getPatternDiagnosis: (userId: number) =>
    apiClient.get(`/users/${userId}/pattern-diagnosis`),
  runPatternDiagnosis: (userId: number) =>
    apiClient.post(`/users/${userId}/pattern-diagnosis`),
  forcePatternDiagnosis: (userId: number) =>
    apiClient.patch(`/users/${userId}/pattern-diagnosis/force`),
};

// Admin API
export const adminApi = {
  getResults: () => apiClient.get('/admin/results'),
};

export { apiClient };
export default apiClient;
