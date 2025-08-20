import fetch from "node-fetch";

const token = "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";
const model = "deepseek/DeepSeek-V3-0324";

async function test() {
  const response = await fetch(`https://api.github.com/models/${model}/invoke`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: "Qual é a capital de Moçambique?",
      parameters: { temperature: 0.7, max_tokens: 1000 }
    })
  });

  const data = await response.json();
  console.log(data);
}

test();
