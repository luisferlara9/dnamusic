// ──────────────────────────────────────────────────────────────
// DNA Music API — Rutas de Estudiantes
// CRUD completo — OPERADOR solo ve su sede, ADMIN ve todo
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createEstudianteSchema, updateEstudianteSchema } from '../validators/schemas';
import {
  getEstudiantes,
  getEstudianteById,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante,
} from '../controllers/estudiante.controller';

const router = Router();

// Todas las rutas de estudiantes requieren autenticación
router.use(authenticate);

// GET /api/estudiantes — Listar (ADMIN: todos, OPERADOR: solo su sede)
router.get('/', getEstudiantes);

// GET /api/estudiantes/:id — Obtener por ID (con verificación de sede)
router.get('/:id', getEstudianteById);

// POST /api/estudiantes — Crear estudiante
router.post('/', validate(createEstudianteSchema), createEstudiante);

// PUT /api/estudiantes/:id — Actualizar estudiante
router.put('/:id', validate(updateEstudianteSchema), updateEstudiante);

// DELETE /api/estudiantes/:id — Eliminar estudiante
router.delete('/:id', deleteEstudiante);

export default router;
