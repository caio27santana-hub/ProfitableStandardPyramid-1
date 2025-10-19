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
