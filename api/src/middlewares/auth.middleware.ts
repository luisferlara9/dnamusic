// ──────────────────────────────────────────────────────────────
// DNA Music API — Middleware de Autenticación JWT
// Verifica el token y extrae la información del usuario
// ──────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Extiende el tipo Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
    sedeId: number | null;
  };
}

interface JwtPayload {
  id: number;
  email: string;
  rol: string;
  sedeId: number | null;
}

/**
 * Middleware de autenticación.
 * Verifica que el request tenga un token JWT válido en el header Authorization.
 * Formato esperado: "Bearer <token>"
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado',
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      sedeId: decoded.sedeId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

/**
 * Middleware de autorización por rol.
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
      return;
    }

    if (!roles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
      return;
    }

    next();
  };
};
