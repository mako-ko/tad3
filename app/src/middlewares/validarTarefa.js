// aula 502 - middleware para validar tarefa, sem banco de dados (memória local)

const validarTarefa = (req, res, next) => {
    const { titulo } = req.body;
    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({ erro: "O campo 'titulo' é obrigatório." });
    }
    next();
};
module.exports = validarTarefa;