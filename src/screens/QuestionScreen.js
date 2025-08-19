import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function QuestionScreen({ route, navigation }) {
  const { exam } = route.params || {};
  if (!exam || !exam.questions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro: Exame não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = exam.questions.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  function handleSelect(idx) {
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowResult(true);
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent(current - 1);
    }
  }

  function getScore() {
    let score = 0;
    for (let i = 0; i < answers.length; i++) {
      if (questions[i].answer === answers[i]) score++;
    }
    return score;
  }

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cotação Final</Text>
        <Text style={styles.question}>Você acertou {getScore()} de {questions.length} questões!</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exam.title}</Text>
      <Text style={styles.question}>Pergunta {current + 1}: {questions[current].text}</Text>
      {questions[current].options.map((option, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.option, answers[current] === idx && { backgroundColor: '#b3e5fc' }]}
          onPress={() => handleSelect(idx)}
        >
          <Text>{option}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.explanation} onPress={() => alert(questions[current].explanation)}>
        <Text style={{ color: '#007AFF' }}>Ver Explicação</Text>
      </TouchableOpacity>

      <View style={styles.slideNav}>
        <TouchableOpacity
          style={[styles.slideButton, current === 0 && { opacity: 0.5 }]}
          onPress={handlePrev}
          disabled={current === 0}
        >
          <Text style={styles.slideButtonText}>Anterior</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.slideButton,
            answers[current] === null && { backgroundColor: '#f44336' }
          ]}
          onPress={handleNext}
          disabled={answers[current] === null}
        >
          <Text style={styles.slideButtonText}>Seguinte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.questionIndicator}>
        {questions.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.indicatorDot,
              idx === current && styles.indicatorDotActive,
              answers[idx] === null && styles.indicatorDotBlank
            ]}
          />
        ))}
        <Text style={styles.indicatorText}>Pergunta {current + 1} de {questions.length}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  question: { fontSize: 18, marginBottom: 15 },
  option: { backgroundColor: '#e0e0e0', padding: 12, borderRadius: 8, marginVertical: 5, width: '80%', alignItems: 'center' },
  explanation: { marginTop: 20 },
  slideNav: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: 20 },
  slideButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center', width: '45%' },
  slideButtonText: { color: '#fff', fontSize: 16 },
  questionIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  indicatorDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#ccc', marginHorizontal: 4 },
  indicatorDotActive: { backgroundColor: '#007AFF' },
  indicatorDotBlank: { backgroundColor: '#f44336' },
  indicatorText: { marginLeft: 12, fontSize: 16 },
  backButton: { marginTop: 20, backgroundColor: '#ccc', padding: 10, borderRadius: 8, alignItems: 'center', width: '80%' },
  backButtonText: { color: '#333', fontSize: 16 },
});
