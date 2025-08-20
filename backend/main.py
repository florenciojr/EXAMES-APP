from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = FastAPI()

# Carrega modelo e tokenizer
tokenizer = AutoTokenizer.from_pretrained("google/gemma-3-270m")
model = AutoModelForCausalLM.from_pretrained("google/gemma-3-270m")

class Question(BaseModel):
    question: str
    options: list[str]
    max_length: int = 1024

@app.post("/ask")
async def generate_answer(req: Question):
    try:
        # Monta o prompt
        prompt = f"""Você é um explicador virtual para exames de Moçambique.
Questão: {req.question}
Alternativas: {', '.join(req.options)}

Explique o raciocínio passo a passo:"""

        # Gera resposta
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model.generate(
            inputs["input_ids"],
            max_length=req.max_length,
            temperature=0.7,
            do_sample=True
        )
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)

        return {"generated_text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))