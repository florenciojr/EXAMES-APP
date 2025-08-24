import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { examService } from '../services/examService';
import { authService } from '../services/authService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';

const ProgressScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log('Não foi possível carregar dados do usuário:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Carregando dados de progresso...');
      
      // Carregar histórico e estatísticas em paralelo
      const [historyData, statsData] = await Promise.all([
        examService.getExamHistory(),
        examService.getUserStats()
      ]);
      
      console.log('✅ Dados carregados:', {
        historyCount: historyData.length,
        stats: statsData
      });
      
      setHistory(historyData);
      setStats(statsData);
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleExamPress = (exam) => {
    setSelectedExam(exam);
    setModalVisible(true);
  };

  const viewExamDetails = () => {
    setModalVisible(false);
    navigation.navigate('ExamDetails', { 
      examId: selectedExam.id,
      examData: selectedExam 
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    return '#dc3545';
  };

  const clearHistory = async () => {
    Alert.alert(
      "Limpar Histórico",
      "Tem certeza que deseja limpar todo seu histórico de exames? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Limpar", 
          style: "destructive",
          onPress: async () => {
            try {
              await examService.clearAllHistory();
              Alert.alert("Sucesso", "Histórico limpo com sucesso!");
              loadData();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível limpar o histórico.");
            }
          }
        }
      ]
    );
  };

  const exportHistory = async () => {
    try {
      Alert.alert("Exportar", "Exportar histórico em formato CSV?", [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Exportar", 
          onPress: async () => {
            try {
              await examService.exportHistory();
              Alert.alert("Sucesso", "Histórico exportado com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível exportar o histórico.");
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const renderHistoryItem = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleExamPress(item)}
      onLongPress={() => exportHistory()}
    >
      <View style={styles.historyContent}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.exam_type}
          </Text>
          <Text style={[
            styles.historyScore,
            { color: getScoreColor(item.score, item.total_questions) }
          ]}>
            {item.score}/{item.total_questions}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(item.score / item.total_questions) * 100}%`,
                backgroundColor: getScoreColor(item.score, item.total_questions)
              }
            ]} 
          />
        </View>
        
        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Icon name="access-time" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatTime(item.time_spent)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="calendar-today" size={14} color="#666" />
            <Text style={styles.detailText}>
              {formatDate(item.completed_at)}
            </Text>
          </View>
        </View>
      </View>
      
      <Icon name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats || stats.total_exams === 0) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>📊 Estatísticas Gerais</Text>
          <View style={styles.statsActions}>
            <TouchableOpacity onPress={exportHistory} style={styles.actionButton}>
              <Icon name="file-download" size={18} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearHistory} style={styles.actionButton}>
              <Icon name="delete" size={18} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_exams}</Text>
            <Text style={styles.statLabel}>Exames</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_questions}</Text>
            <Text style={styles.statLabel}>Questões</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: getScoreColor(stats.average_score, 100) }]}>
              {Math.round(stats.average_score)}%
            </Text>
            <Text style={styles.statLabel}>Acerto</Text>
          </View>
        </View>

        {stats.by_subject && stats.by_subject.length > 0 && (
          <View style={styles.subjectStats}>
            <Text style={styles.subtitle}>Desempenho por Matéria</Text>
            {stats.by_subject.slice(0, 3).map((subject, index) => (
              <View key={index} style={styles.subjectItem}>
                <Text style={styles.subjectName} numberOfLines={1}>
                  {subject.exam_type}
                </Text>
                <View style={styles.subjectProgress}>
                  <View 
                    style={[
                      styles.subjectProgressBar,
                      { width: `${subject.average_score}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.subjectScore}>
                  {Math.round(subject.average_score)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="assignment" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>Nenhum exame realizado</Text>
      <Text style={styles.emptyStateSubtext}>
        Complete seu primeiro exame para ver suas estatísticas aqui
      </Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('Exams')}
      >
        <Text style={styles.startButtonText}>Iniciar Primeiro Exame</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando seu progresso...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meu Progresso</Text>
          {user && (
            <Text style={styles.userWelcome}>
              Olá, {user.name || user.email}!
            </Text>
          )}
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#dc3545" />
            <Text style={styles.errorTitle}>Oops! Algo deu errado</Text>
            <Text style={styles.errorText}>{error}</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor={'#007AFF'}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {renderStats()}
            
            <View style={styles.historySection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Histórico de Exames {history.length > 0 && `(${history.length})`}
                </Text>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory}>
                    <Text style={styles.clearText}>Limpar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {history.length === 0 ? (
                renderEmptyState()
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  renderItem={renderHistoryItem}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              )}
            </View>
          </ScrollView>
        )}

        {/* Modal de detalhes do exame */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedExam?.exam_type}</Text>
              
              <View style={styles.modalStats}>
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>{selectedExam?.score}/{selectedExam?.total_questions}</Text>
                  <Text style={styles.modalStatLabel}>Pontuação</Text>
                </View>
                
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>
                    {Math.round((selectedExam?.score / selectedExam?.total_questions) * 100)}%
                  </Text>
                  <Text style={styles.modalStatLabel}>Acerto</Text>
                </View>
                
                <View style={styles.modalStat}>
                  <Text style={styles.modalStatValue}>
                    {formatTime(selectedExam?.time_spent)}
                  </Text>
                  <Text style={styles.modalStatLabel}>Tempo</Text>
                </View>
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButtonSecondary}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Fechar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalButtonPrimary}
                  onPress={viewExamDetails}
                >
                  <Text style={styles.modalButtonTextPrimary}>Ver Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  container: { 
    flex: 1, 
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userWelcome: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statsActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  subjectStats: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  subjectName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  subjectProgress: {
    flex: 2,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  subjectProgressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  subjectScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 40,
    textAlign: 'right',
  },
  historySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  clearText: {
    color: '#dc3545',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  historyItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyContent: {
    flex: 1,
    marginRight: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  historyScore: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  separator: {
    height: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    marginRight: 12,
    alignItems: 'center',
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProgressScreen;