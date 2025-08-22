import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
// ...existing code...

import { exams } from '../data/examsData';
// ...existing code...

export default function ExamsScreen({ route, navigation }) {
  const { name } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, {name} 👋</Text>
      <Text style={styles.subtitle}>Escolha um exame:</Text>

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.examButton} onPress={() => navigation.navigate('Question', { exam: item })}>
            <Text style={styles.examText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.backButtonText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// ...existing code...

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 15 },
  examButton: { backgroundColor: '#e0e0e0', padding: 15, borderRadius: 8, marginVertical: 5, width: 250, alignItems: 'center' },
  examText: { fontSize: 16 },
  backButton: {
    marginTop: 20,
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
});
