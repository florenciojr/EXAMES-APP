import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CORREÇÃO: Use apenas o IP/porta SEM /api no final
const API_BASE_URL = 'http://192.168.1.4:5000'; // SEM /api no final

console.log('🔗 Configurando API com baseURL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token adicionado à requisição:', config.url);
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

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta da API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

export default api;