// ──────────────────────────────────────────────────────────────
// DNA Music API — Índice de Rutas
// Centraliza todas las rutas de la aplicación
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import authRoutes from './auth.routes';
import sedeRoutes from './sede.routes';
import estudianteRoutes from './estudiante.routes';
import statsRoutes from './stats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sedes', sedeRoutes);
router.use('/estudiantes', estudianteRoutes);
router.use('/stats', statsRoutes);

export default router;
