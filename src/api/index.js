import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 서버 주소에 맞게 변경

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// User API
export const signup = (userData) => apiClient.post('/user/signup', userData);
export const login = (credentials) => apiClient.post('/user/login', credentials);
export const logout = () => apiClient.post('/user/logout');
export const getProfile = () => apiClient.get('/user/profile');
export const updateProfile = (profileData) => apiClient.patch('/user/profile', profileData);

// Rooms API
export const createRoom = (roomData) => apiClient.post('/rooms', roomData);
export const deleteRoom = (roomId) => apiClient.delete(`/rooms/${roomId}`);
export const getRoomInfo = (meetingCode) => apiClient.get(`/rooms/${meetingCode}`);
export const joinRoom = (meetingCode) => apiClient.post(`/rooms/${meetingCode}/join`);
export const leaveRoom = (roomId) => apiClient.post(`/rooms/${roomId}/leave`);

// Memories API
export const getMemories = () => apiClient.get('/memories');
export const uploadMemory = (roomId, memoryData) => apiClient.post(`/rooms/${roomId}/memories`, memoryData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteMemory = (memoryId) => apiClient.delete(`/memories/${memoryId}`);

// Stickers API
export const getStickers = () => apiClient.get('/stickers');
export const uploadSticker = (stickerData) => apiClient.post('/stickers', stickerData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteSticker = (stickerId) => apiClient.delete(`/stickers/${stickerId}`);
