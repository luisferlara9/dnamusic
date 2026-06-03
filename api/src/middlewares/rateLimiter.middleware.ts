// ──────────────────────────────────────────────────────────────
// DNA Music API — Rate Limiting
// Protección contra fuerza bruta en login y abuso general
// ──────────────────────────────────────────────────────────────

import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Rate limiter global — Protege contra abuso general de la API.
 * 100 requests por ventana de 15 minutos por IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,  // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false,   // Deshabilita headers `X-RateLimit-*`
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  },
});

/**
 * Rate limiter específico para login — Más restrictivo.
 * 5 intentos por ventana de 15 minutos por IP.
 * Protección contra ataques de fuerza bruta.
 */
export const loginRateLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  max: config.loginRateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de login. Intenta de nuevo más tarde.',
  },
});
