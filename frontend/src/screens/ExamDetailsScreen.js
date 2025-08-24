// src/screens/ExamDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { examService } from '../services/examService';

const ExamDetailsScreen = ({ route }) => {
  const { examId, examData } = route.params || {};
  const [examDetails, setExamDetails] = useState(examData);
  const [loading, setLoading] = useState(!examData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!examData && examId) {
      loadExamDetails();
    }
  }, [examId]);

  const loadExamDetails = async () => {
    try {
      setLoading(true);
      const details = await examService.getExamDetails(examId);
      setExamDetails(details);
    } catch (err) {
      setError('Erro ao carregar detalhes do exame');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Carregando detalhes do exame...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!examDetails) {
    return (
      <View style={styles.container}>
        <Text>Nenhum dado do exame disponível.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{examDetails.exam_type}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{examDetails.score}/{examDetails.total_questions}</Text>
          <Text style={styles.statLabel}>Pontuação</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            {Math.round((examDetails.score / examDetails.total_questions) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Acerto</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{examDetails.time_spent}s</Text>
          <Text style={styles.statLabel}>Tempo</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Data do Exame</Text>
      <Text style={styles.date}>
        {new Date(examDetails.completed_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>

      {examDetails.questions && examDetails.questions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Questões</Text>
          {examDetails.questions.map((question, index) => (
            <View key={index} style={[
              styles.questionCard,
              question.is_correct ? styles.correctCard : styles.incorrectCard
            ]}>
              <Text style={styles.questionText}>{index + 1}. {question.question_text}</Text>
              
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>Sua resposta:</Text>
                <Text style={styles.userAnswer}>{question.user_answer}</Text>
              </View>
              
              <View style={styles.answerContainer}>
                <Text style={styles.answerLabel}>Resposta correta:</Text>
                <Text style={styles.correctAnswer}>{question.correct_answer}</Text>
              </View>
              
              {question.explanation && (
                <View style={styles.explanationContainer}>
                  <Text style={styles.explanationLabel}>Explicação:</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>
              )}
              
              <Text style={[
                styles.resultBadge,
                question.is_correct ? styles.correctBadge : styles.incorrectBadge
              ]}>
                {question.is_correct ? '✓ Correta' : '✗ Incorreta'}
              </Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  stat: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8
  },
  questionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4
  },
  correctCard: {
    borderLeftColor: '#28a745'
  },
  incorrectCard: {
    borderLeftColor: '#dc3545'
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333'
  },
  answerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  answerLabel: {
    fontWeight: '500',
    color: '#666'
  },
  userAnswer: {
    fontWeight: 'bold',
    color: '#dc3545'
  },
  correctAnswer: {
    fontWeight: 'bold',
    color: '#28a745'
  },
  explanationContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  explanationLabel: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#666'
  },
  explanationText: {
    color: '#333'
  },
  resultBadge: {
    marginTop: 8,
    padding: 6,
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  correctBadge: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  incorrectBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 16
  }
});

export default ExamDetailsScreen;