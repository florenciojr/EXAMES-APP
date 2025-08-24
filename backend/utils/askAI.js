// Rota do askAI - integração com Gemini
app.post('/askAI', async (req, res) => {
  const { question, options, history = [] } = req.body;

  try {
    // Formatar o histórico
    const formattedHistory = history.map(msg => ({
      role: msg.role || "user",
      parts: (msg.parts || []).map(p => ({ text: p.text }))
    }));

    const API_KEY = process.env.GEMINI_API_KEY || "sua_chave_gemini_aqui";
    const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const payload = {
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [
            {
              text: `Você é um explicador virtual que ajuda alunos de Moçambique a estudar para exames de admissão. 

Seu papel não é só dar a resposta, mas sim:
- Dar pistas e dicas.
- Fazer perguntas guiadas ao aluno.
- Explicar o raciocínio passo a passo.
- No fim, incentivar o aluno a tentar novamente.

Questão: ${question}
Alternativas: ${options.join(", ")}`
            }
          ]
        }
      ]
    };

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                      data?.error?.message || 
                      "Desculpe, não consegui gerar uma resposta.";

    res.json({ answer: resultText });
  } catch (err) {
    console.error("Erro no askAI:", err);
    res.status(500).json({ 
      error: "Erro ao conectar à IA",
      message: err.message 
    });
  }
});