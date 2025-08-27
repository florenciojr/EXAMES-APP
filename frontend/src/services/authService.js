import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      console.log('🔐 Tentando login com:', email);
      
      // ✅ CORREÇÃO: Use a rota CORRETA baseada no seu servidor
      const response = await api.post('/api/auth/login', { 
        email: email.trim(),
        password: password.trim()
      });
      
      console.log('✅ Resposta do login:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro no login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro no login');
    }
  },

  // Registrar
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password.trim()
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro no registro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro no registro');
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('❌ Erro ao obter usuário:', error);
      return null;
    }
  },

  // Obter token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error);
      return false;
    }
  }
};

export default authService;