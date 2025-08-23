import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';

export default function ProgressScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/questions/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seu Progresso 📊</Text>
      
      {history.length === 0 ? (
        <Text style={styles.noData}>Nenhum exame realizado ainda.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyTitle}>{item.exam_type}</Text>
              <Text>Pontuação: {item.score}/{item.total_questions}</Text>
              <Text>Data: {new Date(item.completed_at).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  noData: { textAlign: 'center', fontSize: 16, marginTop: 20 },
  historyItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  historyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  }
});