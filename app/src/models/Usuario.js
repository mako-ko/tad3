import mongoose from 'mongoose'; // (aula 504)
import bcrypt from 'bcrypt'; // (aula 505) para criptografar a senha antes de salvar no banco

// Esquema do usuário (aula 504)
const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [ true, "O nome é obrigatório." ]
    },
    email: {
        type: String,
        required: [true, "O email é obrigatório."],
        unique: true,
        lowercase: true,
        trim: true
    },
    // A senha é obrigatória e não deve ser retornada em consultas por padrão (aula 505)
    senha: {
        type: String,
        required: [true, "A senha é obrigatória."],
        select: false // Nâo retorna a senha em consultas
    }
});

// Hook para criptografar a senha antes de salvar (aula 505)
usuarioSchema.pre("save", async function (next) {
    if (!this.isModified("senha")) {
        return next();
    }
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
});

// Criar o modelo e exportar (aula 504)
const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;