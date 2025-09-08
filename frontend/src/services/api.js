import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ CORREÇÃO: A URL deve incluir o prefixo /api, pois o seu backend está configurado assim.
//const API_BASE_URL = 'http://10.89.220.253:5000/api';
const API_BASE_URL = 'http://localhost:5000/api';

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