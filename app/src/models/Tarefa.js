import mongoose from 'mongoose';

const tarefaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "O campo título é obrigatório."],
        minlength: [3, "O título deve ter no mínimo 3 caracteres."],
        maxlength: [50, "O título deve ter no máximo 50 caracteres."],
        trim: true
    },
    concluida: {
        type: Boolean,
        default: false
    },
    prioridade: {
        type: String,
        required: [true, "O campo prioridade é obrigatório."],
        enum: ["Baixa", "Média", "Alta"],
        default: "Baixa"
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, "O campo usuário é obrigatório."]
    },
    // Campo para armazenar o caminho do arquivo anexado (aula 506) (usos comuns: foto de perfil, documento único, avatar, etc.)
    anexo: {
        type: String, // Armazenaremos o caminho do arquivo no servidor
        default: null // O campo anexo é opcional, então o padrão é null (VS Code AI sugeriu)
    },
    // Para permitir múltiplos anexos, poderíamos usar um array de strings (aula 506) (usos comuns: galeria de fotos, múltiplos documentos, anexos de email, etc.)
    anexos: [{
        type: String,
        default: null
    }]
},
    {
        timestamps: true // Adiciona createdAt e updatedAt automaticamente
    });

const Tarefa = mongoose.model('Tarefa', tarefaSchema);

export default Tarefa;