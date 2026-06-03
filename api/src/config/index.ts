// ──────────────────────────────────────────────────────────────
// DNA Music API — Configuración centralizada
// Todas las variables de entorno se validan y centralizan aquí
// ──────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  loginRateLimitWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10),
  loginRateLimitMaxRequests: parseInt(process.env.LOGIN_RATE_LIMIT_MAX_REQUESTS || '5', 10),
} as const;

// Validar que las variables críticas estén presentes
if (config.nodeEnv === 'production' && config.jwtSecret === 'fallback-secret-do-not-use-in-production') {
  throw new Error('❌ JWT_SECRET debe ser configurado en producción');
}
