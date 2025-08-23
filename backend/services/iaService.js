const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class IAService {
  constructor() {
    this.API_KEY = process.env.GEMINI_API_KEY || "AIzaSyA2m380MuY_J-8Reb-VvZ1B9IPX0xc6AbU";
    this.ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    this.isConfigured = !!this.API_KEY;
  }

  isReady() {
    return this.isConfigured;
  }

  async generateContent(prompt, timeout = 15000) {
    if (!this.isReady()) {
      throw new Error("Serviço de IA não configurado. Verifique GEMINI_API_KEY.");
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(this.ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.API_KEY
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!result) {
        throw new Error("Resposta vazia da API Gemini");
      }

      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("Timeout: A IA demorou muito para responder");
      }
      throw new Error(`Falha na geração de conteúdo: ${error.message}`);
    }
  }

  async askQuestion(question, options = [], history = []) {
    try {
      const formattedHistory = history.map(msg => ({
        role: msg.role || "user",
        parts: (msg.parts || []).map(p => ({ text: p.text }))
      }));

      const prompt = `Você é um explicador virtual para alunos de Moçambique.

DIRETRIZES:
- NUNCA dê a resposta diretamente
- Forneça pistas e dicas úteis
- Faça perguntas guiadas
- Explique o raciocínio passo a passo
- Seja encorajador e positivo

QUESTÃO: ${question}
OPÇÕES: ${options.join(" | ")}

HISTÓRICO:
${formattedHistory.map((h, i) => `${i + 1}. ${h.role}: ${h.parts[0].text}`).join("\n")}

Sua resposta deve ajudar o aluno a pensar criticamente.`;

      return await this.generateContent(prompt);
    } catch (error) {
      throw error;
    }
  }

  async testConnection() {
    try {
      if (!this.isReady()) {
        return {
          success: false,
          error: "API_KEY não configurada"
        };
      }

      const testQuestion = "Qual é a capital de Moçambique?";
      const testOptions = ["Maputo", "Beira", "Nampula", "Quelimane"];
      
      const response = await this.askQuestion(testQuestion, testOptions);
      
      return {
        success: true,
        question: testQuestion,
        response: response.substring(0, 200) + "...",
        service: "Gemini AI"
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new IAService();