// ──────────────────────────────────────────────────────────────
// DNA Music API — Middleware de manejo global de errores
// Captura errores no manejados y retorna respuestas consistentes
// ──────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de manejo global de errores.
 * Captura cualquier error que no haya sido manejado por los controladores.
 * En producción, no expone detalles del error al cliente.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error no manejado:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    // Solo mostrar detalles en desarrollo
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

/**
 * Middleware para rutas no encontradas (404).
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
  });
};
