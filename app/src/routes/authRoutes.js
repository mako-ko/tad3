import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Usuario from '../models/Usuario.js';
import enviarEmail from '../services/emailService.js'; // Importar serviço de envio de e-mail (aula 508)

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas para registro e login de usuários
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Erro de validação ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */

// Rota de Registro (removi o try/catch para simplificar - aula 508)
router.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body;
    const novoUsuario = new Usuario({ nome, email, senha });
    await novoUsuario.save();

    // Enviar e-mail de boas-vindas (aula 508)
    const assunto = "Bem-vindo à API da Marianne - Gerenciador de Tarefas!";
    const corpo = `
            <h1>Olá, ${nome}!</h1>
            <p>Seja bem-vindo à API da Marianne - Gerenciador de Tarefas!</p>
            <p>Seu cadastro foi realizado com sucesso.</p>
        `;
    await enviarEmail(email, assunto, corpo);

    res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro interno ao fazer login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */

// Rota de Login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('+senha');
        // add verificação de senha usando bcrypt.compare (aula 505)
        if (!usuario || !await bcrypt.compare(senha, usuario.senha)) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }

        // Gerar token JWT (aula 505)
        const token = jwt.sign(
            { id: usuario._id },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao fazer login." });
    }
});

export default router;