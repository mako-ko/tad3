import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
/* código extra do arquivo de troubleshooting

import fs from 'fs'; // já tem no arquivo src/index.js. Perguntar ao prof se precisa importar aqui também ou se pode usar o fs do index.js
import { fileURLToPath } from 'url'; // já tem no arquivo src/index.js. Perguntar ao prof se precisa importar aqui também ou se pode usar o fileURLToPath do index.js


// Configuração do multer para armazenamento de arquivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, '../uploads');

//  src/config -> src -> app
const uploadDir = path.join(__dirname, '..', '..', '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
} */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        const hash = crypto.randomBytes(16).toString('hex');
        const filename = `${hash}-${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({ storage });

export default upload;