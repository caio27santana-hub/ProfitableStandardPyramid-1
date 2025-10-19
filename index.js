import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
// Não precisamos mais de 'path' ou 'url' para esta solução
// import path from 'path';
// import { fileURLToPath } from 'url';

dotenv.config();

// (Configuração do __dirname removida, pois não é mais necessária)

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

// --- MUDANÇA PRINCIPAL AQUI ---
// Esta linha diz ao Express: "Qualquer arquivo que o navegador pedir,
// procure por ele dentro da pasta 'public' e envie-o."
// Ele encontrará 'index.html', 'login.css' e qualquer outro arquivo lá.
app.use(express.static("public"));

// ... (seu código existente, como app.use(express.json()))

// --- ADICIONE ESTA NOVA ROTA AQUI ---
// 🔌 Endpoint para receber as mensagens do chat
app.post("/chat", async (req, res) => {
  try {
    // 1. Pega a mensagem do usuário que veio do frontend
    // (O nome 'message' pode variar. Verifique o que seu JS está enviando,
    // pode ser 'prompt', 'userInput', etc.)
    const { message } = req.body;

    console.log("Mensagem recebida do usuário:", message);

    // 2. AQUI VAI A LÓGICA DA SUA IA
    //    (Ex: Chamar a API do Gemini com a 'message' do usuário)
    //
    //    const respostaDaIA = await chamarGemini(message);

    // Por enquanto, vamos apenas simular uma resposta:
    const respostaDaIA = "Eu sou uma resposta simulada da IA para: " + message;

    // 3. Envia a resposta da IA de volta para o frontend
    res.json({ success: true, response: respostaDaIA });
  } catch (error) {
    console.error("Erro no endpoint /chat:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro interno no servidor." });
  }
});
// --- FIM DA NOVA ROTA ---

// Suas outras rotas (como /db-status)
app.get("/db-status", async (req, res) => {
  // ... (seu código do db-status)
});

// ... (seu código app.listen no final)

app.get("/db-status", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    res.status(200).json({
      status: "Conexão com o PostgreSQL OK",
      hora_atual_db: result.rows[0].now,
    });
  } catch (err) {
    // ... (código do catch)
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Express iniciado e ouvindo na porta ${PORT}`);
});
