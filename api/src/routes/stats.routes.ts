// ──────────────────────────────────────────────────────────────
// DNA Music API — Rutas de Estadísticas
// GET /api/stats — Solo ADMIN — Queries agregadas
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getStats } from '../controllers/stats.controller';

const router = Router();

// GET /api/stats — ADMIN y OPERADOR
router.get('/', authenticate, authorize('ADMIN', 'OPERADOR'), getStats);

export default router;
