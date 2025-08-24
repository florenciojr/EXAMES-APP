// src/screens/ExamsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { examService } from '../services/examService';
import { authService } from '../services/authService';

export default function ExamsScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando exames...');
      
      const response = await examService.getExams();
      
      // ✅ VERIFIQUE A ESTRUTURA DA RESPOSTA
      console.log('📦 Resposta completa:', response);
      
      // A resposta pode vir em response.data ou response diretamente
      const examsData = response.data || response;
      
      if (examsData && examsData.success !== false) {
        // Pode vir como examsData.data ou examsData diretamente
        const examsList = examsData.data || examsData;
        console.log(`✅ ${examsList.length} exames carregados`);
        setExams(Array.isArray(examsList) ? examsList : []);
      } else {
        console.log('⚠️  Nenhum exame encontrado ou estrutura inválida');
        setExams([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar exames:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exames');
      setExams([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExams();
  };

  const handleExamPress = async (exam) => {
    try {
      console.log('🎯 Exame selecionado:', exam.id, exam.title);
      
      // ✅ BUSCAR DADOS COMPLETOS DO EXAME (COM QUESTÕES)
      console.log('🔍 Buscando dados completos do exame...');
      const examResponse = await examService.getExam(exam.id);
      
      // Verificar estrutura da resposta
      const examData = examResponse.data || examResponse;
      const fullExam = examData.data || examData;
      
      console.log('📦 Exame completo:', fullExam);
      console.log('❓ Número de questões:', fullExam.questions ? fullExam.questions.length : 0);
      
      if (!fullExam.questions || fullExam.questions.length === 0) {
        Alert.alert('Aviso', 'Este exame não possui questões disponíveis.');
        return;
      }
      
      // ✅ NAVEGAR PARA A TELA DE QUESTÕES
      navigation.navigate('Question', { 
        exam: fullExam
      });
      
    } catch (error) {
      console.error('❌ Erro ao carregar exame:', error);
      Alert.alert('Erro', 'Não foi possível carregar o exame');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando exames...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exames Disponíveis</Text>
      <Text style={styles.subtitle}>Escolha um exame para iniciar</Text>

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.examCard}
            onPress={() => handleExamPress(item)}
          >
            <Text style={styles.examTitle}>{item.title}</Text>
            <Text style={styles.examSubject}>{item.subject}</Text>
            <Text style={styles.examDetails}>
              {item.difficulty} • {item.total_questions || 'N'} questões • {item.duration_minutes || '?'} min
            </Text>
            {item.description && (
              <Text style={styles.examDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum exame disponível no momento.
          </Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f7', 
    padding: 16 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 8,
    color: '#333'
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center',
    marginBottom: 24,
    color: '#666'
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666'
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20
  },
  examCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
  },
  examSubject: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
    fontWeight: '500'
  },
  examDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  examDescription: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic'
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
    padding: 20
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});