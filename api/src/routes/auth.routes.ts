// ──────────────────────────────────────────────────────────────
// DNA Music API — Rutas de Autenticación
// POST /api/auth/register — Registro de usuarios
// POST /api/auth/login    — Login con JWT
// ──────────────────────────────────────────────────────────────

import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/schemas';
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login — Con rate limiting específico para login
router.post('/login', loginRateLimiter, validate(loginSchema), login);

export default router;
