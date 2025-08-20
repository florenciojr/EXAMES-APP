// backend/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "AIzaSyA2m380MuY_J-8Reb-VvZ1B9IPX0xc6AbU"; // ⚠️ substitui pela tua chave real
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

app.post("/askAI", async (req, res) => {
  const { question, options, history = [] } = req.body;

  try {
    // força o history a ficar no formato certo
    const formattedHistory = history.map(msg => ({
      role: msg.role || "user",
      parts: (msg.parts || []).map(p => ({ text: p.text }))
    }));

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

    const data = await response.json();
    console.log("Resposta da IA:", JSON.stringify(data, null, 2));

    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      data?.error?.message ||
      null;

    if (!resultText) {
      res.status(500).json({ error: "Resposta inesperada da IA", raw: data });
    } else {
      res.json({ answer: resultText });
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
    res.status(500).json({ error: "Erro ao conectar à IA" });
  }
});

app.listen(3000, "0.0.0.0", () =>
  console.log("✅ Backend rodando em http://0.0.0.0:3000")
);
