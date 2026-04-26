import express from 'express';
import cors from 'cors';
import alunosRoutes from '../routes/alunosRoutes.js';
import authRoutes from '../routes/authRoutes.js';
import rachaRoutes from '../routes/rachaRoutes.js'; 
import aulasRoutes from '../routes/aulasRoutes.js';
import usuariosRoutes from '../routes/usuariosRoutes.js'; 
import presencasRoutes from '../routes/presencasRoutes.js';
import dotenv from 'dotenv';

const app = express(); 
dotenv.config();

// middlewares
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// rotas
app.use('/alunos', alunosRoutes);
app.use('/auth', authRoutes);
app.use('/rachas', rachaRoutes);
app.use('/aulas', aulasRoutes);
app.use('/usuarios', usuariosRoutes); 
app.use('/presencas', presencasRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});