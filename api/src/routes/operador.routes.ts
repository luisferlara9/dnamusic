import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOperadorSchema, updateOperadorSchema } from '../validators/schemas';
import {
  getOperadores,
  getOperadorById,
  createOperador,
  updateOperador,
  deleteOperador,
} from '../controllers/operador.controller';

const router = Router();

// Todas las rutas de operadores requieren autenticación y rol ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/operadores — Listar operadores
router.get('/', getOperadores);

// GET /api/operadores/:id — Obtener operador por ID
router.get('/:id', getOperadorById);

// POST /api/operadores — Crear operador
router.post('/', validate(createOperadorSchema), createOperador);

// PUT /api/operadores/:id — Actualizar operador
router.put('/:id', validate(updateOperadorSchema), updateOperador);

// DELETE /api/operadores/:id — Eliminar operador
router.delete('/:id', deleteOperador);

export default router;
