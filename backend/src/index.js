import alunosRoutes from './routes/alunosRoutes.js';
import authRoutes from './routes/authRoutes.js';
import rachaRoutes from './routes/rachaRoutes.js';
import aulasRoutes from './routes/aulasRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import presencasRoutes from './routes/presencasRoutes.js';
import turmasRoutes from './routes/turmasRoutes.js';
import inscricoesRoutes from './routes/inscricoesRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';

import { bloquearInadimplente } from './middlewares/financeiroMiddleware.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { gerarMensalidades } from './services/financeiroService.js';