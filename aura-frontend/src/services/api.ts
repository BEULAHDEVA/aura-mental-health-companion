import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aura_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    anonymousLogin: async () => {
        const response = await api.post('/auth/anonymous-login');
        localStorage.setItem('aura_token', response.data.access_token);
        return response.data;
    },
};

export const journalService = {
    createEntry: async (content: string) => {
        const response = await api.post('/journal/entry', { content });
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/journal/history');
        return response.data;
    },
};

export const analyticsService = {
    getDashboard: async () => {
        const response = await api.get('/analytics/dashboard');
        return response.data;
    },
    getTrends: async () => {
        const response = await api.get('/analytics/stress-trends');
        return response.data;
    },
};

export const chatService = {
    sendMessage: async (message: string) => {
        const response = await api.post('/chat/message', { message });
        return response.data;
    },
};

export default api;
