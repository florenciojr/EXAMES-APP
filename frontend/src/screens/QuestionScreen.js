import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { examService } from '../services/examService';
import { askAI } from '../utils/askAI';

export default function QuestionScreen({ route, navigation }) {
  const { exam } = route.params;
  
  // Estados das questões
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados do chat IA
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];

  useEffect(() => {
    // Limpar chat quando mudar de questão
    setChatHistory([]);
    setUserInput('');
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    
    const isCorrect = answerIndex === currentQuestion.answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    setAnsweredQuestions([
      ...answeredQuestions,
      {
        question: currentQuestion.text,
        userAnswer: answerIndex,
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrect,
        explanation: currentQuestion.explanation
      }
    ]);

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishExam();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const finishExam = async () => {
    setLoading(true);
    try {
      await examService.saveExamHistory({
        examType: exam.title,
        questions: answeredQuestions,
        score: score,
        totalQuestions: exam.questions.length,
        timeSpent: 0
      });

      Alert.alert(
        'Exame Concluído!',
        `Você acertou ${score} de ${exam.questions.length} questões.`,
        [
          {
            text: 'Ver Resultados',
            onPress: () => navigation.navigate('Progress')
          },
          {
            text: 'Voltar aos Exames',
            onPress: () => navigation.navigate('Exams')
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
      Alert.alert('Erro', 'Não foi possível salvar o histórico do exame');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || loadingAI) return;

    // Adiciona mensagem do usuário ao chat
    const userMessage = { role: 'user', parts: [{ text: userInput.trim() }] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setUserInput('');
    setLoadingAI(true);

    try {
      // Chama a IA
      const aiResponse = await askAI(
        currentQuestion.text,
        currentQuestion.options,
        newHistory
      );

      // Adiciona resposta da IA ao chat
      const aiMessage = { role: 'model', parts: [{ text: aiResponse }] };
      setChatHistory([...newHistory, aiMessage]);
    } catch (error) {
      console.error('Erro ao chamar IA:', error);
      const errorMessage = { role: 'model', parts: [{ text: 'Desculpe, tive um problema. Poderia tentar novamente?' }] };
      setChatHistory([...newHistory, errorMessage]);
    } finally {
      setLoadingAI(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Salvando resultados...</Text>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>Carregando questão...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Cabeçalho com progresso */}
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Questão {currentQuestionIndex + 1} de {exam.questions.length}
        </Text>
        <Text style={styles.scoreText}>Acertos: {score}/{exam.questions.length}</Text>
      </View>

      {/* Questão atual */}
      <ScrollView style={styles.questionSection}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          
          {/* Opções de resposta */}
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
                showExplanation && index === currentQuestion.answer && styles.correctOption,
                showExplanation && selectedAnswer === index && selectedAnswer !== currentQuestion.answer && styles.wrongOption
              ]}
              onPress={() => !showExplanation && handleAnswerSelect(index)}
              disabled={showExplanation}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}

          {/* Explicação */}
          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>
                {selectedAnswer === currentQuestion.answer ? '✅ Correto!' : '❌ Incorreto'}
              </Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </View>

        {/* Chat IA - Mini Chat */}
        <View style={styles.chatContainer}>
          <TouchableOpacity 
            style={styles.chatHeader}
            onPress={() => setIsChatMinimized(!isChatMinimized)}
          >
            <Text style={styles.chatTitle}>💬 Explicador Virtual {isChatMinimized ? '▶' : '▼'}</Text>
          </TouchableOpacity>

          {!isChatMinimized && (
            <>
              <ScrollView style={styles.chatMessages} nestedScrollEnabled={true}>
                {chatHistory.map((message, index) => (
                  <View
                    key={index}
                    style={[
                      styles.messageBubble,
                      message.role === 'user' ? styles.userMessage : styles.aiMessage
                    ]}
                  >
                    <Text style={[
                      styles.messageText,
                      message.role === 'user' && styles.userMessageText
                    ]}>
                      {message.parts[0].text}
                    </Text>
                  </View>
                ))}
                {loadingAI && (
                  <View style={styles.aiMessage}>
                    <ActivityIndicator size="small" color="#666" />
                  </View>
                )}
              </ScrollView>

              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Pergunte ao explicador..."
                  value={userInput}
                  onChangeText={setUserInput}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={styles.sendButton} 
                  onPress={handleSendMessage}
                  disabled={loadingAI || !userInput.trim()}
                >
                  <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Navegação */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNextQuestion}
        >
          <Text style={styles.navButtonText}>
            {currentQuestionIndex === exam.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  questionSection: {
    flex: 1,
    padding: 15,
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  optionButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3'
  },
  correctOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50'
  },
  wrongOption: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336'
  },
  optionText: {
    fontSize: 16,
    color: '#333'
  },
  explanationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3'
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  chatHeader: {
    backgroundColor: '#007AFF',
    padding: 15,
  },
  chatTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  chatMessages: {
    maxHeight: 200,
    padding: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    marginLeft: '20%'
  },
  aiMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    marginRight: '20%'
  },
  messageText: {
    fontSize: 14,
  },
  userMessageText: {
    color: '#fff'
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center'
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center'
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  navButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center'
  },
  nextButton: {
    backgroundColor: '#28a745'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  loadingText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666'
  }
});