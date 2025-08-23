import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Login
  login: async (email, password) => {
    try {
      console.log('Tentando login com:', email);
      const response = await api.post('/auth/login', { 
        email: email.trim(),
        password: password.trim()
      });
      
      console.log('Resposta do login:', response.data);
      
      if (response.data.token) {
        // Salvar user COM ID no AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        }));
        console.log('Token e user salvos com sucesso');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro no login. Verifique o servidor.');
    }
  },

  // Registrar
  register: async (userData) => {
    try {
      console.log('Tentando registrar:', userData);
      const response = await api.post('/auth/register', {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password.trim()
      });
      
      console.log('Resposta do registro:', response.data);
      
      if (response.data.token) {
        // Salvar user COM ID no AsyncStorage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erro no registro. Verifique o servidor.');
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  },

  // Obter token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }
};

export default authService;