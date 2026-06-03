// ──────────────────────────────────────────────────────────────
// DNA Music API — App Setup
// Configuración principal de Express y middlewares
// ──────────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

// ─── Security Middlewares ─────────────────────────────────────
// Helmet protege configurando varios HTTP headers de seguridad
app.use(helmet());

// CORS — Solo permite solicitudes desde el frontend (configurado)
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true, // Importante si usamos cookies en el futuro
  })
);

// Limitar el número de requests desde una misma IP
app.use(globalRateLimiter);

// ─── Parsers ──────────────────────────────────────────────────
// Limitar el payload del body para prevenir DoS (Payload To Large)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Rutas ────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Error Handling ───────────────────────────────────────────
// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejador global de errores (debe ser el último middleware)
app.use(errorHandler);

export default app;
