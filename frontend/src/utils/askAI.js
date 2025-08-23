// Utilitário para integração com IA
export async function askAI(questionText, options, history = []) {
  const BACKEND_URL = "https://587bf9ce06c5.ngrok-free.app/askAI";

  if (!questionText || !options || !options.length) {
    console.error("⚠️ questionText ou options inválidos");
    return "Erro: parâmetros inválidos";
  }

  // garante que o histórico seja enviado no formato certo
  const formattedHistory = history.map(msg => ({
    role: msg.role || "user",
    parts: (msg.parts || []).map(p => ({ text: p.text }))
  }));

  try {
    console.log("Enviando pergunta para IA:", questionText);
    console.log("Opções:", options);
    console.log("Histórico:", formattedHistory.length, "mensagens");

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: questionText,
        options: options,
        history: formattedHistory
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro do backend:", errorText);
      return `Erro do backend: ${errorText}`;
    }

    const data = await response.json();
    console.log("Resposta da IA recebida");
    return data.answer || "Resposta vazia da IA";
  } catch (err) {
    console.error("Erro ao conectar ao backend:", err);
    return "Erro ao conectar ao backend. Verifique sua conexão.";
  }
}

// Funções auxiliares para geração de questões (opcional)
export const aiHelper = {
  generateQuestions: async (examType, topic, difficulty, numberOfQuestions) => {
    try {
      console.log(`Solicitando questões: ${examType}, ${topic}, ${difficulty}, ${numberOfQuestions}`);
      
      // Simulação - você pode integrar com sua IA real aqui
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const questions = [];
      for (let i = 1; i <= numberOfQuestions; i++) {
        questions.push({
          id: i,
          question: `Questão ${i} sobre ${topic} para ${examType} (${difficulty})`,
          options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          correctAnswer: 'Opção A',
          explanation: `Explicação detalhada da questão ${i}`,
          topic: topic,
          difficulty: difficulty
        });
      }
      
      return questions;
    } catch (error) {
      console.error('Erro ao gerar questões:', error);
      throw error;
    }
  },
  
  evaluateAnswer: async (question, userAnswer) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        isCorrect: userAnswer === question.correctAnswer,
        explanation: question.explanation,
        correctAnswer: question.correctAnswer
      };
    } catch (error) {
      console.error('Erro ao avaliar resposta:', error);
      throw error;
    }
  }
};