// utils/askAI.js
export async function askAI(questionText, options) {
  // usa o link do ngrok no lugar do IP local
  const BACKEND_URL = "https://7dbd31371ac8.ngrok-free.app/askAI";

  if (!questionText || !options || !options.length) {
    console.error("⚠️ questionText ou options inválidos");
    return "Erro: parâmetros inválidos";
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: questionText,
        options: options
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
