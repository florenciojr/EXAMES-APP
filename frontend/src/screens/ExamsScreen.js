import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { examService } from '../services/examService';
import { authService } from '../services/authService';

export default function ExamsScreen({ route, navigation }) {
  const { name } = route.params || {};
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log('🔄 Buscando exames da API...');
      
      // Buscar lista de exames
      const examsList = await examService.getExams();
      console.log('📋 Exames da API (lista):', examsList);
      
      // Para cada exame, buscar os dados COMPLETOS com questões
      const examsWithQuestions = await Promise.all(
        examsList.map(async (exam) => {
          try {
            console.log(`🔍 Buscando exame completo: ${exam.id} - ${exam.title}`);
            const fullExam = await examService.getExam(exam.id);
            
            // ✅ LOG CRÍTICO - Verifique o que está vindo da API
            console.log(`📦 Exame ${exam.id} COMPLETO:`, JSON.stringify(fullExam, null, 2));
            console.log(`❓ Questões do exame ${exam.id}:`, fullExam.questions ? fullExam.questions.length : 'UNDEFINED');
            
            return fullExam;
          } catch (error) {
            console.log(`❌ Erro ao buscar exame ${exam.id}:`, error);
            return { ...exam, questions: [] };
          }
        })
      );
      
      console.log('🎯 Exames finais com questões:', examsWithQuestions);
      setExams(examsWithQuestions);
      
    } catch (error) {
      console.error('❌ Erro ao buscar exames:', error);
      Alert.alert('Erro', 'Não foi possível carregar os exames');
    } finally {
      setLoading(false);
    }
  };

  const handleExamPress = (exam) => {
    try {
      console.log('🎯 Exame selecionado:', exam.title);
      console.log('📊 Dados completos do exame:', exam);
      console.log('❓ Questões no handle:', exam.questions);
      console.log('🔢 Número de questões:', exam.questions ? exam.questions.length : 0);
      
      // Verifica se o exame tem questões
      if (!exam.questions || exam.questions.length === 0) {
        console.log('⚠️  ALERTA: Exame sem questões!');
        Alert.alert('Aviso', 'Este exame não possui questões disponíveis.');
        return;
      }
      
      console.log('✅ Navegando para questões...');
      navigation.navigate('Question', { 
        exam: exam
      });
      
    } catch (error) {
      console.error('❌ Erro ao navegar para exame:', error);
      Alert.alert('Erro', 'Não foi possível abrir o exame');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
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
      <Text style={styles.title}>Bem-vindo, {name} 👋</Text>
      <Text style={styles.subtitle}>Escolha um exame:</Text>

      {exams.length === 0 ? (
        <Text style={styles.noExamsText}>Nenhum exame disponível no momento.</Text>
      ) : (
        <FlatList
          data={exams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.examButton} 
              onPress={() => handleExamPress(item)}
            >
              <Text style={styles.examTitle}>{item.title}</Text>
              <Text style={styles.examDetails}>
                {item.subject} • {item.difficulty} • {item.questions?.length || 0} questões
              </Text>
              {item.description && (
                <Text style={styles.examDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mantenha os styles...}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    textAlign: 'center',
    color: '#333'
  },
  subtitle: { 
    fontSize: 18, 
    marginBottom: 20, 
    textAlign: 'center',
    color: '#666'
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666'
  },
  listContainer: {
    paddingBottom: 20
  },
  examButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333'
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
  noExamsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16
  }
});