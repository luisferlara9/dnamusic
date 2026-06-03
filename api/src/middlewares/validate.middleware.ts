// ──────────────────────────────────────────────────────────────
// DNA Music API — Middleware de validación con Zod
// Valida el body del request contra un schema de Zod
// ──────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory que valida el body del request.
 * Si la validación falla, retorna un 400 con los errores detallados.
 * Si pasa, sobreescribe req.body con los datos validados y sanitizados.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // parse() valida Y transforma (trim, toLowerCase, etc.)
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          campo: err.path.join('.'),
          mensaje: err.message,
        }));

        res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: formattedErrors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  };
};
