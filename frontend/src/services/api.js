import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.111.198.168:5000';

console.log('🔗 Configurando API com baseURL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const publicRoutes = [
        '/auth/login',
        '/auth/register',
        '/api/health',
        '/api/test/db',
        '/api/test/exams'
      ];
      
      const isPublicRoute = publicRoutes.some(route => 
        config.url?.includes(route)
      );
      
      if (!isPublicRoute) {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token adicionado à requisição:', config.url);
        }
      }
      
      return config;
    } catch (error) {
      console.error('❌ Erro ao adicionar token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Token inválido - limpando storage');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;