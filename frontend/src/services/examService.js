import api from './api';
import { authService } from './authService';

export const examService = {
  // Buscar todos os exames
  getExams: async () => {
    try {
      const response = await api.get('/exams');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar exames');
    }
  },

  // Buscar exame específico
  getExam: async (examId) => {
    try {
      const response = await api.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar exame');
    }
  },

  // Salvar histórico de exame (CORRIGIDO)
  saveExamHistory: async (examData) => {
    try {
      console.log('Dados recebidos para saveExamHistory:', examData);
      
      // Obter o usuário atual para pegar o user_id
      const user = await authService.getCurrentUser();
      console.log('Usuário atual:', user);
      
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      
      // Preparar dados no formato correto para o backend
      const dataToSend = {
        user_id: user.id, // ✅ user_id incluído
        exam_type: examData.examType,
        questions: examData.questions || [],
        score: examData.score || 0,
        total_questions: examData.totalQuestions || 0,
        time_spent: examData.timeSpent || 0
      };
      
      console.log('Enviando para backend:', dataToSend);
      
      const response = await api.post('/questions/save-history', dataToSend);
      console.log('✅ Histórico salvo com sucesso:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao salvar histórico:', error);
      throw new Error(error.response?.data?.message || error.message || 'Erro ao salvar histórico');
    }
  },

  // Buscar histórico do usuário
  getExamHistory: async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await api.get(`/questions/history/${user.id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar histórico');
    }
  }
};

export default examService;