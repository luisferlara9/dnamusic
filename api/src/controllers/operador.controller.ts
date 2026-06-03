import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateOperadorInput, UpdateOperadorInput } from '../validators/schemas';

// GET /api/operadores
export const getOperadores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        sedeId: true,
        sede: {
          select: {
            nombre: true,
            ciudad: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: 'asc' },
    });

    res.status(200).json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error en getOperadores:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/operadores/:id
export const getOperadorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const usuario = await prisma.user.findUnique({
      where: { id: parseInt(id as string, 10) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        sedeId: true,
        sede: {
          select: {
            nombre: true,
            ciudad: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: usuario });
  } catch (error) {
    console.error('Error en getOperadorById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/operadores
export const createOperador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol, sedeId } = req.body as CreateOperadorInput;

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      return;
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        sedeId: rol === 'OPERADOR' ? (sedeId ?? null) : null, // ADMIN no requiere sede
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        sedeId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Operador creado exitosamente',
      data: newUser,
    });
  } catch (error) {
    console.error('Error en createOperador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/operadores/:id
export const updateOperador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, sedeId } = req.body as UpdateOperadorInput;

    const userId = parseInt(id as string, 10);

    // Verificar existencia del usuario
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    // Verificar duplicidad de email si cambió
    if (email && email !== existingUser.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado por otro usuario' });
        return;
      }
    }

    // Procesar contraseña si viene en la petición
    let hashedPassword = existingUser.password;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nombre: nombre ?? undefined,
        email: email ?? undefined,
        password: hashedPassword,
        rol: rol ?? undefined,
        sedeId: rol === 'ADMIN' ? null : (rol === 'OPERADOR' ? (sedeId ?? null) : (sedeId !== undefined ? sedeId : existingUser.sedeId)),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        sedeId: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Operador actualizado exitosamente',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error en updateOperador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/operadores/:id
export const deleteOperador = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = parseInt(id as string, 10);

    // Impedir que un administrador se auto-elimine
    if (userId === req.user?.id) {
      res.status(400).json({ success: false, message: 'No puedes eliminar tu propia cuenta de administrador' });
      return;
    }

    // Verificar si existe el usuario
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      return;
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ success: true, message: 'Operador eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteOperador:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
