import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username, email, password, password2) =>
    api.post('/users/register/register/', { username, email, password, password2 }),
  login: (username, password) =>
    api.post('/auth/token/', { username, password }),
  getProfile: () => api.get('/users/profile/me/'),
  updateStatus: (status) => api.put('/users/profile/update_status/', { status }),
};

export const contactsAPI = {
  getContacts: () => api.get('/users/contacts/'),
  addContact: (username) => api.post('/users/contacts/add_contact/', { username }),
  removeContact: (username) => api.delete('/users/contacts/remove_contact/', { data: { username } }),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations/'),
  createOrGetConversation: (user_id) => api.post('/messages/conversations/create_or_get/', { user_id }),
  getMessages: (conversation_id) => api.get(`/messages/messages/?conversation_id=${conversation_id}`),
  sendMessage: (conversation_id, encrypted_content, iv) =>
    api.post('/messages/messages/', { conversation_id, encrypted_content, iv }),
  markAsRead: (message_id) => api.post(`/messages/messages/${message_id}/mark_as_read/`),
};

export default api;
