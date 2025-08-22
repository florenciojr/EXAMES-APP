import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput
} from "react-native";
import { askAI } from "../utils/askAI";

export default function QuestionScreen({ route, navigation }) {
  const { exam } = route.params || {};
  if (!exam || !exam.questions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro: Exame não encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const questions = exam.questions.slice(0, 5);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  // chat IA
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [userInput, setUserInput] = useState("");

  function handleSelect(idx) {
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setChatHistory([]); // limpa chat para próxima questão
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

  async function handleSendMessage() {
    if (!userInput.trim()) return;

    // adiciona mensagem do aluno
    const newHistory = [
      ...chatHistory,
      { role: "user", parts: [{ text: userInput }] }
    ];
    setChatHistory(newHistory);
    setUserInput("");
    setLoadingAI(true);

    // envia tudo para IA (pergunta + histórico)
    const response = await askAI(
      questions[current].text,
      questions[current].options,
      newHistory
    );

    const updatedHistory = [
      ...newHistory,
      { role: "model", parts: [{ text: response }] }
    ];
    setChatHistory(updatedHistory);
    setLoadingAI(false);
  }

  if (showResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Resultado Final 🎉</Text>
        <Text style={styles.resultText}>
          Você acertou {getScore()} de {questions.length} questões!
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de Progresso */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((current + 1) / questions.length) * 100}%` }
          ]}
        />
      </View>

      <Text style={styles.title}>{exam.title}</Text>
      <Text style={styles.question}>
        Pergunta {current + 1}: {questions[current].text}
      </Text>

      {/* Opções */}
      <View style={styles.optionsContainer}>
        {questions[current].options.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionCard,
              answers[current] === idx && styles.optionSelected
            ]}
            onPress={() => handleSelect(idx)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat IA */}
      <View style={styles.chatBox}>
        <Text style={styles.chatTitle}>Explicador Virtual 🤖</Text>
        <ScrollView style={styles.chatHistory}>
          {chatHistory.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.chatBubble,
                msg.role === "user"
                  ? styles.chatBubbleUser
                  : styles.chatBubbleAI
              ]}
            >
              <Text
                style={{
                  color: msg.role === "user" ? "#fff" : "#000"
                }}
              >
                {msg.parts[0].text}
              </Text>
            </View>
          ))}
          {loadingAI && <ActivityIndicator size="small" color="#007AFF" />}
        </ScrollView>

        {/* Input do aluno */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua resposta..."
            value={userInput}
            onChangeText={setUserInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navegação */}
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
            answers[current] === null && { backgroundColor: "#ccc" }
          ]}
          onPress={handleNext}
          disabled={answers[current] === null}
        >
          <Text style={styles.slideButtonText}>
            {current === questions.length - 1 ? "Finalizar" : "Seguinte"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
  question: { fontSize: 18, marginBottom: 15, textAlign: "center" },

  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 15
  },
  progressFill: {
    height: 8,
    backgroundColor: "#007AFF"
  },

  optionsContainer: { marginBottom: 20 },
  optionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2
  },
  optionSelected: { backgroundColor: "#b3e5fc" },
  optionText: { fontSize: 16 },

  chatBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    elevation: 2
  },
  chatTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  chatHistory: { maxHeight: 150, marginBottom: 10 },
  chatBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 4,
    maxWidth: "80%"
  },
  chatBubbleUser: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  chatBubbleAI: { backgroundColor: "#e0e0e0", alignSelf: "flex-start" },

  inputRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },

  slideNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  slideButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "45%"
  },
  slideButtonText: { color: "#fff", fontSize: 16 },

  resultText: { fontSize: 18, marginVertical: 20, textAlign: "center" },

  backButton: {
    marginTop: 20,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  backButtonText: { color: "#333", fontSize: 16 }
});
