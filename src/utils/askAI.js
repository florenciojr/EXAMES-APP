// utils/askAI.js
export async function askAI(questionText, options, history = []) {
  const BACKEND_URL = "https://7dbd31371ac8.ngrok-free.app/askAI"; // atualiza sempre o ngrok

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
    return data.answer || "Resposta vazia da IA";
  } catch (err) {
    console.error("Erro ao conectar ao backend:", err);
    return "Erro ao conectar ao backend";
  }
}
