# Exames App

Este é um aplicativo móvel desenvolvido com React Native e Expo, projetado para ajudar estudantes de Moçambique a se prepararem para os exames de admissão. O aplicativo utiliza um backend em Node.js com Express para se conectar a uma API de inteligência artificial e fornecer explicações e dicas sobre as questões dos exames.

## Pré-requisitos

Antes de começar, certifique-se de que você tem as seguintes ferramentas instaladas em sua máquina:

*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [Yarn](https://yarnpkg.com/)
*   [Expo CLI](https://docs.expo.dev/get-started/installation/)
*   Opcional: [Git](https://git-scm.com/) para clonar o repositório.

## Configuração do Ambiente

Siga os passos abaixo para configurar o projeto em seu ambiente local.

### 1. Clonar o Repositório (Opcional)

Se você ainda não tem o projeto, clone o repositório:

```bash
git clone https://github.com/florenciojr/EXAMES-APP.git
cd EXAMES-APP
```

### 2. Instalar Dependências do Frontend

Na raiz do projeto, instale as dependências do React Native/Expo:

```bash
npm install
# ou
yarn install
```

### 3. Configurar o Backend

O backend é um servidor Node.js que está na pasta `backend/`. As dependências (`express`, `cors`, etc.) já foram instaladas no passo anterior, pois estão listadas no `package.json` principal.

### 4. Configurar a Conexão Frontend-Backend

Para que o aplicativo (frontend) possa se comunicar com o seu servidor local (backend), você precisa de um endereço que seja acessível a partir do seu emulador ou dispositivo físico.

#### Opção 1: Usando o Endereço IP Local (Para a mesma rede Wi-Fi)

Se o seu computador e o seu dispositivo móvel estiverem na mesma rede Wi-Fi, você pode usar o endereço IP local do seu computador.

1.  Descubra o endereço IP da sua máquina na rede local (ex: `192.168.1.10`).
2.  Abra o arquivo `src/utils/askAI.js` e altere a variável `BACKEND_URL` para este endereço:

```javascript
const BACKEND_URL = "http://192.168.1.10:3000/askAI";
```

#### Opção 2: Usando `ngrok` (Recomendado para Dispositivos Físicos)

O `ngrok` é uma ferramenta que cria um túnel seguro para o seu `localhost`, expondo seu servidor local à internet através de um URL público. Isso é especialmente útil quando o método de IP local não funciona ou quando você quer testar de uma rede diferente.

1.  **Instale o `ngrok`**: Siga as instruções de instalação no [site oficial do ngrok](https://ngrok.com/download).

2.  **Inicie o `ngrok`**: Depois de iniciar o seu servidor backend (que roda na porta 3000), abra um **novo terminal** e execute:
    ```bash
    ngrok http 3000
    ```

3.  **Copie a URL do `ngrok`**: O `ngrok` irá gerar um URL público (ex: `https://aleatorio-123.ngrok-free.app`). Copie este endereço.

4.  **Atualize o código**: Abra o arquivo `src/utils/askAI.js` e cole a URL do `ngrok`, não se esquecendo de adicionar o caminho `/askAI` no final:
    ```javascript
    // Exemplo de como deve ficar
    const BACKEND_URL = "https://aleatorio-123.ngrok-free.app/askAI";
    ```
**Importante:** A cada vez que você reiniciar o `ngrok`, um novo URL será gerado. Portanto, você precisará atualizar o `BACKEND_URL` no código sempre que iniciar o `ngrok` novamente.

## Rodando o Projeto

Com o ambiente configurado, siga os passos abaixo para rodar a aplicação.

### 1. Iniciar o Servidor Backend

Abra um terminal, navegue até a pasta do projeto e execute o seguinte comando para iniciar o servidor backend:

```bash
node backend/server.js
```

Você deverá ver a seguinte mensagem no console, indicando que o servidor está rodando:

```
✅ Backend rodando em http://0.0.0.0:3000
```

### 2. Iniciar o Aplicativo Frontend

Abra **outro terminal** na raiz do projeto e inicie o aplicativo com o Expo:

```bash
npm start
# ou
expo start
```

Isso abrirá o Metro Bundler no seu navegador. A partir daqui, você pode:
*   **Escanear o QR code** com o aplicativo Expo Go no seu celular (Android ou iOS) para rodar o app no seu dispositivo.
*   Pressionar `a` para tentar abrir o app em um emulador Android (se configurado).
*   Pressionar `i` para tentar abrir o app em um simulador iOS (se configurado em um macOS).
*   Pressionar `w` para abrir o app em seu navegador web.

## Observações

*   O backend utiliza uma chave de API do Google Gemini que está hardcoded no arquivo `backend/server.js`. Para uso em produção ou para evitar limitações, é recomendado que você substitua a chave de exemplo pela sua própria chave de API.
*   Existe um arquivo `backend/main.py` que é uma implementação alternativa do backend usando Python e FastAPI. Este servidor não é utilizado pelo aplicativo e pode ser ignorado na configuração padrão.
