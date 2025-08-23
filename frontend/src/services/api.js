import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL base da API - escolha uma das opções:

// OPÇÃO 1: Localhost (para emulador)
// const API_BASE_URL = 'http://localhost:5000/api';

// OPÇÃO 2: IP local (para dispositivo físico na mesma rede)
const API_BASE_URL = 'http://192.168.1.2:5000/api'; // Substitua pelo seu IP

// OPÇÃO 3: Ngrok (para teste externo) - SEM a porta
//const API_BASE_URL = 'https://83787de3c17f.ngrok-free.app/api';

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
        console.log('Token adicionado à requisição');
      }
      return config;
    } catch (error) {
      console.error('Erro ao adicionar token:', error);
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
    console.log('Resposta da API:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Erro na API:', {
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