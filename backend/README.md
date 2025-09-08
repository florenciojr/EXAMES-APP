# EXAMES-APP Backend

Backend organizado seguindo arquitetura MVC (Model-View-Controller) para o aplicativo de exames.

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração do banco de dados
├── controllers/             # Lógica de negócio
│   ├── authController.js    # Autenticação (login, registro, perfil)
│   ├── examController.js    # Gerenciamento de exames
│   ├── debugController.js   # Rotas de teste e debug
│   └── aiController.js      # Integração com IA
├── middleware/
│   └── auth.js             # Middleware de autenticação JWT
├── models/                 # Modelos de dados
│   ├── User.js            # Modelo de usuário
│   ├── Exam.js            # Modelo de exame
│   └── QuestionHistory.js # Histórico de questões
├── routes/                # Definição de rotas
│   ├── auth.js           # Rotas de autenticação
│   ├── exams.js          # Rotas de exames
│   ├── debug.js          # Rotas de debug/teste
│   ├── aiRoutes.js       # Rotas de IA
│   ├── history.js        # Rotas de histórico
│   └── questions.js      # Rotas de questões
├── services/             # Serviços externos
│   └── iaService.js      # Serviço de IA
├── utils/               # Utilitários
│   └── askAI.js         # Utilitário para IA
├── App.js              # Aplicação principal (apenas middleware e roteamento)
├── server.js           # Servidor alternativo
├── package.json        # Dependências
└── .env               # Variáveis de ambiente
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta backend:
```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=exames_app

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# IA (Gemini)
GEMINI_API_KEY=sua_chave_api_gemini

# Servidor
PORT=5000
NODE_ENV=development
```

### 3. Iniciar o Servidor
```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

## 📡 Endpoints da API

### Autenticação (Público)
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário (protegido)

### Exames (Protegido)
- `GET /api/exams` - Listar todos os exames
- `GET /api/exams/:id` - Buscar exame específico
- `POST /api/exams` - Criar novo exame
- `POST /api/exams/:id/questions` - Adicionar questão
- `POST /api/exams/:id/verify` - Verificar respostas

### IA (Protegido)
- `POST /api/ai/ask` - Fazer pergunta para IA
- `GET /api/ai/status` - Status do serviço de IA

### Debug/Teste (Público)
- `GET /api/test/db` - Testar conexão com BD
- `GET /api/test/exams` - Testar funcionalidade de exames
- `GET /api/test/exam/:id` - Testar exame específico
- `GET /api/test/health` - Health check
- `GET /api/test/info` - Informações da API

### Outros
- `GET /api/health` - Health check geral
- `GET /` - Informações da API

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas:

1. Faça login em `/api/auth/login`
2. Use o token retornado no header: `Authorization: Bearer <token>`

## 🏗️ Arquitetura MVC

### Controllers
- **authController.js**: Gerencia autenticação, registro e perfil
- **examController.js**: Gerencia exames, questões e correção
- **debugController.js**: Rotas de teste e debug
- **aiController.js**: Integração com serviços de IA

### Models
- **User.js**: Operações com usuários
- **Exam.js**: Operações com exames e questões
- **QuestionHistory.js**: Histórico de questões respondidas

### Routes
- Definem apenas as rotas e delegam para os controllers
- Não contêm lógica de negócio

### Middleware
- **auth.js**: Verifica tokens JWT e define rotas públicas

## 🧪 Testando a API

### Teste Rápido
```bash
# Health check
curl http://localhost:5000/api/health

# Teste de BD
curl http://localhost:5000/api/test/db

# Listar exames
curl http://localhost:5000/api/exams
```

### Teste com Autenticação
```bash
# Registrar usuário
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'

# Usar token retornado
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔧 Desenvolvimento

### Adicionando Novos Controllers
1. Crie o arquivo em `controllers/nomeController.js`
2. Implemente as funções necessárias
3. Crie as rotas em `routes/nome.js`
4. Registre as rotas no `App.js`

### Adicionando Novos Models
1. Crie o arquivo em `models/Nome.js`
2. Implemente as operações de banco de dados
3. Use nos controllers conforme necessário

## 📝 Logs

O servidor registra todas as requisições no formato:
```
2024-01-01T12:00:00.000Z - GET /api/health
```

## 🚨 Tratamento de Erros

- Todos os erros são capturados e retornados em formato JSON
- Em desenvolvimento, detalhes do erro são incluídos
- Em produção, apenas mensagens genéricas são retornadas
