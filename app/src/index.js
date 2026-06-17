import express from "express";
import 'express-async-errors'; // Importar no topo para habilitar tratamento de erros em rotas assíncronas (aula 508)
import fs from "fs"; // para manipulação de arquivos (aula 506)
import path from "path"; // para manipulação de caminhos de arquivos e diretórios (aula 506)
import jwt from "jsonwebtoken"; // para geração e verificação de tokens JWT (aula 505)
import mongoose from "mongoose";
import dotenv from "dotenv";
import os from "os"; // para obter informações do sistema operacional (aula 507)
import process from "process"; // para acessar variáveis de ambiente e informações do processo (aula 507)
import swaggerUi from "swagger-ui-express"; // para servir a interface do Swagger UI (aula 507)

import { fileURLToPath } from "url"; // para obter o caminho do arquivo atual (aula 506)

import swaggerSpecs from "./config/swagger.js"; // importando a configuração do Swagger (aula 507)
import authRoutes from './routes/authRoutes.js'; // add authRoutes (aula 505)
import tarefasRoutes from './routes/tarefasRoutes.js'; // add tarefasRoutes (aula 503)
import usuariosRoutes from './routes/usuariosRoutes.js'; // add usuariosRoutes (aula 504)
import commentariosRoutes from './routes/comentariosRoutes.js'; // add comentariosRoutes (aula 507)
import logger from './config/logger.js'; // Importar logger (aula 508)

dotenv.config();

const __filename = fileURLToPath(import.meta.url); // __filename é o caminho completo do arquivo atual (index.js) (aula 506)
const __dirname = path.dirname(__filename); // __dirname é o diretório do arquivo atual, ou seja, a pasta src (aula 506)

const app = express();
app.use(express.json());

// Porta configurável via variável de ambiente, com fallback para 3000 (aula 502)
const port = Number(process.env.PORT || 3000);

// para aceitar conexões de qualquer IP (aula 507)
const host = "0.0.0.0";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/tarefasDB";

// Logs úteis para depuração (aula 507)
logger.info("[BOOT] NODE_ENV=%s, PORT=%s, MONGODB_URI=%s", process.env.NODE_ENV, port, uri);

// Conexão com MongoDB
(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    logger.info("[MONGO] Conectado com sucesso.");
  } catch (err) {
    logger.error("[MONGO] Falha ao conectar:", err?.message || err);
  }
})();

// Criar diretório de uploads se não existir (aula 506)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Endpoint de diagnóstico completo
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    node: process.version,
    pid: process.pid,
    platform: os.platform(),
    arch: os.arch(),
    uptime: process.uptime(),
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
    },
    mongoReady: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  });
});

// Rota raiz (aula 503)
app.get("/", (_req, res) => {
  res.send('<html><body><h1>API da Marianne - Gerenciador de Tarefas com MongoDB</h1><p>Status em <a href="/health">/health</a></p><p>Documentação em <a href="/api-docs">/api-docs</a></p></body></html>');
});

// Servir especificação OpenAPI em JSON (aula 507)
// Esse arquivo pode ser usado por ferramentas externas, como Insomnia,
// Postman, Swagger Editor ou geradores de cliente de API.
app.get("/openapi.json", (_req, res) => {

  // Informa ao cliente que a resposta será um JSON.
  // Isso ajuda navegadores e ferramentas externas a interpretarem corretamente o conteúdo retornado.
  res.setHeader("Content-Type", "application/json");

  // Envia a especificação OpenAPI gerada pelo swagger-jsdoc.
  // A variável swaggerSpecs vem do arquivo src/config/swagger.js.
  res.send(swaggerSpecs);
});

// Servir documentação Swagger (aula 507)
// Ao acessar http://localhost:3000/api-docs, o aluno verá uma documentação interativa da API, podendo consultar endpoints e testar requisições.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Servir arquivos estáticos da pasta 'uploads' (aula 506)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Montar as rotas de autenticação (aula 505)
app.use('/auth', authRoutes);

// Montar as rotas de usuários (aula 504)
app.use('/usuarios', usuariosRoutes);

// Montar as rotas de tarefas (aula 503)
app.use('/tarefas', tarefasRoutes);

// Montar as rotas de comentários (aula 507)
app.use('/comentarios', commentariosRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({
    erro: 'Ocorreu um erro inesperado no servidor.' });
});

// Handlers globais para não derrubar o processo
process.on("unhandledRejection", (err) => {
  logger.error("[UNHANDLED REJECTION]", err);
});
process.on("uncaughtException", (err) => {
  logger.error("[UNCAUGHT EXCEPTION]", err);
});

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, host, () => {
    logger.info(`[BOOT] Servidor ouvindo em http://${host}:${port}`);
  });
}

// Exportar app para testes
export default app;