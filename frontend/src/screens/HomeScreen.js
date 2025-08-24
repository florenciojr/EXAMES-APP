// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { authService } from '../services/authService';
import { examService } from '../services/examService';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen({ navigation, route }) {
  const [userStats, setUserStats] = useState({
    totalExams: 0,
    averageScore: 0,
    totalQuestions: 0
  });
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas do usuário
      const stats = await examService.getUserStats();
      setUserStats({
        totalExams: stats.total_exams || 0,
        averageScore: stats.average_score || 0,
        totalQuestions: stats.total_questions || 0
      });
      
      // Carregar exames recentes (usando o histórico)
      const history = await examService.getExamHistory();
      setRecentExams(history.slice(0, 3)); // Últimos 3 exames
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleStartExam = () => {
    navigation.navigate('Exams');
  };

  const handleSeeProgress = () => {
    navigation.navigate('Progress');
  };

  const handleSeeExamDetails = (exam) => {
    navigation.navigate('ExamDetails', { 
      examId: exam.id,
      examData: exam 
    });
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Seu Progresso</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalExams}</Text>
          <Text style={styles.statLabel}>Exames Feitos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(userStats.averageScore)}%</Text>
          <Text style={styles.statLabel}>Pontuação Média</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalQuestions}</Text>
          <Text style={styles.statLabel}>Questões Respondidas</Text>
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Ações Rápidas</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.examButton]}
          onPress={handleStartExam}
        >
          <Icon name="quiz" size={24} color="#fff" />
          <Text style={styles.actionText}>Iniciar Exame</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.progressButton]}
          onPress={handleSeeProgress}
        >
          <Icon name="trending-up" size={24} color="#fff" />
          <Text style={styles.actionText}>Ver Progresso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentExams = () => (
    <View style={styles.recentExams}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Exames Recentes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      
      {recentExams.length === 0 ? (
        <Text style={styles.noExamsText}>Nenhum exame realizado ainda</Text>
      ) : (
        recentExams.map((exam, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.examCard}
            onPress={() => handleSeeExamDetails(exam)}
          >
            <View style={styles.examContent}>
              <Text style={styles.examTitle} numberOfLines={1}>
                {exam.exam_type}
              </Text>
              <View style={styles.examDetails}>
                <Text style={styles.examScore}>
                  {exam.score}/{exam.total_questions} pontos
                </Text>
                <Text style={styles.examDate}>
                  {new Date(exam.completed_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Olá, Estudante!</Text>
          <Text style={styles.subWelcomeText}>Bem-vindo de volta</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="exit-to-app" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.scrollView}
      >
        {/* Estatísticas */}
        {renderStatsCard()}

        {/* Ações rápidas */}
        {renderQuickActions()}

        {/* Exames recentes */}
        {renderRecentExams()}

        {/* Espaço no final */}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subWelcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  examButton: {
    backgroundColor: '#007AFF',
  },
  progressButton: {
    backgroundColor: '#28a745',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  recentExams: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  noExamsText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  examContent: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  examDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  examScore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  examDate: {
    fontSize: 12,
    color: '#666',
  },
  spacer: {
    height: 20,
  },
});