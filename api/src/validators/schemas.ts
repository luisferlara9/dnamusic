// ──────────────────────────────────────────────────────────────
// DNA Music API — Schemas de validación con Zod
// Validación estricta de inputs para prevenir datos maliciosos
// ──────────────────────────────────────────────────────────────

import { z } from 'zod';

// ─── Auth Schemas ────────────────────────────────────────────

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  email: z
    .string()
    .email('El email no es válido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres') // límite de bcrypt
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      'La contraseña debe incluir mayúscula, minúscula, número y carácter especial'
    ),
  rol: z.enum(['ADMIN', 'OPERADOR'], {
    errorMap: () => ({ message: 'El rol debe ser ADMIN o OPERADOR' }),
  }),
  sedeId: z.number().int().positive().optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('El email no es válido')
    .max(255)
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .max(72),
});

// ─── Sede Schemas ────────────────────────────────────────────

export const createSedeSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100)
    .trim(),
  ciudad: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100)
    .trim(),
  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(255)
    .trim(),
  estado: z.enum(['ACTIVA', 'INACTIVA']).optional().default('ACTIVA'),
});

export const updateSedeSchema = createSedeSchema.partial();

// ─── Estudiante Schemas ──────────────────────────────────────

export const createEstudianteSchema = z.object({
  nombreCompleto: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150)
    .trim(),
  email: z
    .string()
    .email('El email no es válido')
    .max(255)
    .toLowerCase()
    .trim(),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 caracteres')
    .max(20)
    .trim(),
  documentoIdentidad: z
    .string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20)
    .trim(),
  programa: z
    .string()
    .min(2, 'El programa debe tener al menos 2 caracteres')
    .max(150)
    .trim(),
  estado: z
    .enum(['ACTIVO', 'INACTIVO', 'RETIRADO'])
    .optional()
    .default('ACTIVO'),
  sedeId: z.number().int().positive('El ID de sede debe ser un número positivo'),
  fechaInscripcion: z
    .string()
    .datetime()
    .optional(),
});

export const updateEstudianteSchema = createEstudianteSchema.partial();

// ─── Types inferidos ─────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSedeInput = z.infer<typeof createSedeSchema>;
export type UpdateSedeInput = z.infer<typeof updateSedeSchema>;
export type CreateEstudianteInput = z.infer<typeof createEstudianteSchema>;
export type UpdateEstudianteInput = z.infer<typeof updateEstudianteSchema>;
