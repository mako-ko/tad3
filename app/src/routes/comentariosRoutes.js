import express from 'express';
import mongoose from 'mongoose';
import Comentario from '../models/Comentario.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comentários
 *   description: Rotas para comentários e respostas de tarefas
 */

/**
 * @swagger
 * /comentarios:
 *   post:
 *     summary: Cria um comentário
 *     tags: [Comentários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoComentario'
 *     responses:
 *       201:
 *         description: Comentário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       400:
 *         description: Erro de validação ao criar comentário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */

router.post('/', async (req, res) => {
    const novoComentario = new Comentario(req.body);
    await novoComentario.save();
    res.status(201).json(novoComentario);
});

/**
 * @swagger
 * /comentarios/tarefa/{tarefaId}:
 *   get:
 *     summary: Lista comentários principais de uma tarefa
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: tarefaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Lista de comentários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comentario'
 *       500:
 *         description: Erro ao buscar comentários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/tarefa/:tarefaId', async (req, res) => {
    try {
        const comentarios = await Comentario.find({
            tarefa: req.params.tarefaId,
            comentarioPai: null
        });

        res.json(comentarios);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar comentários." });
    }
});

/**
 * @swagger
 * /comentarios/{comentarioId}/respostas:
 *   get:
 *     summary: Lista respostas de um comentário
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário
 *     responses:
 *       200:
 *         description: Lista de respostas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comentario'
 *       500:
 *         description: Erro ao buscar respostas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:comentarioId/respostas', async (req, res) => {
    try {
        const respostas = await Comentario.find({
            comentarioPai: req.params.comentarioId
        });

        res.json(respostas);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar respostas." });
    }
});

/**
 * @swagger
 * /comentarios/{comentarioId}/arvore-flat:
 *   get:
 *     summary: Busca um comentário com sua árvore de respostas em formato plano
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário raiz
 *     responses:
 *       200:
 *         description: Árvore de comentários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       404:
 *         description: Comentário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao buscar árvore de comentários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:comentarioId/arvore-flat', async (req, res) => {
    try {
        const resultado = await Comentario.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.params.comentarioId)
                }
            },
            {
                $graphLookup: {
                    from: 'comentarios',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'comentarioPai',
                    as: 'respostas',
                    maxDepth: 10
                }
            }
        ]);

        if (resultado.length === 0) {
            return res.status(404).json({ erro: "Comentário não encontrado." });
        }

        res.json(resultado[0]);
    } catch (err) {
        res.status(500).json({
            erro: "Erro ao buscar árvore de comentários." +
                err?.message || err
        });
    }
});

async function buscarComentariosComRespostas(comentarioId) {
    const comentario = await Comentario.findById(comentarioId).lean();

    if (!comentario) {
        return null;
    }

    const respostas = await Comentario.find({
        comentarioPai: comentarioId
    }).lean();

    comentario.respostas = await Promise.all(
        respostas.map(resposta => buscarComentariosComRespostas(resposta._id))
    );

    return comentario;
}

/**
 * @swagger
 * /comentarios/{comentarioId}/arvore-aninhada:
 *   get:
 *     summary: Busca um comentário com sua árvore de respostas aninhada
 *     tags: [Comentários]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do comentário raiz
 *     responses:
 *       200:
 *         description: Árvore aninhada de comentários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comentario'
 *       404:
 *         description: Comentário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao buscar árvore de comentários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:comentarioId/arvore-aninhada', async (req, res) => {
    try {
        const arvore = await buscarComentariosComRespostas(
            req.params.comentarioId
        );

        if (!arvore) {
            return res.status(404).json({ erro: "Comentário não encontrado." });
        }

        res.json(arvore);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar árvore de comentários." });
    }
});

export default router;