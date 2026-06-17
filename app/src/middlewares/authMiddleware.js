import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: "Token não fornecido ou mal formatado." });
    }

    /* 
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ erro: "Erro no formato do token." });
    } 
    
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ erro: "Token mal formatado." });
    } 
    */

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ erro: "Token inválido." });
        }
        req.usuarioId = decoded.id;
        next();
    });
}