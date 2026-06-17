import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: [true, "O campo texto é obrigatório."]
    },
    autor: {
        type: String,
        required: [true, "O campo autor é obrigatório."]
    },
    tarefa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarefa',
        required: [true, "O campo tarefa é obrigatório."]
    },
    // Referência recursiva: um comentário pode ter um "pai"
    comentarioPai: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario',
        default: null // null significa que é um comentário raiz
    }
}, { timestamps: true });

const Comentario = mongoose.model('Comentario', comentarioSchema);

export default Comentario;