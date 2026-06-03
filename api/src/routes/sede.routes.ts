// ──────────────────────────────────────────────────────────────
// DNA Music API — Rutas de Sedes
// CRUD completo — Solo ADMIN puede crear, editar, eliminar
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createSedeSchema, updateSedeSchema } from '../validators/schemas';
import {
  getSedes,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
} from '../controllers/sede.controller';

const router = Router();

// Todas las rutas de sedes requieren autenticación
router.use(authenticate);

// GET /api/sedes — Listar sedes (ADMIN y OPERADOR)
router.get('/', getSedes);

// GET /api/sedes/:id — Obtener sede por ID (ADMIN y OPERADOR)
router.get('/:id', getSedeById);

// POST /api/sedes — Crear sede (solo ADMIN)
router.post('/', authorize('ADMIN'), validate(createSedeSchema), createSede);

// PUT /api/sedes/:id — Actualizar sede (solo ADMIN)
router.put('/:id', authorize('ADMIN'), validate(updateSedeSchema), updateSede);

// DELETE /api/sedes/:id — Eliminar sede (solo ADMIN)
router.delete('/:id', authorize('ADMIN'), deleteSede);

export default router;
