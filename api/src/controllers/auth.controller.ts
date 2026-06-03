import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { config } from '../config';
import { RegisterInput, LoginInput } from '../validators/schemas';

/**
 * Función helper para mitigar Timing Attacks en el Login.
 * Si el usuario no existe, igual hacemos un cálculo de hash para que
 * el tiempo de respuesta sea similar a un login exitoso.
 */
const dummyHash = bcrypt.hashSync('dummy_password', 10);

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, rol, sedeId } = req.body;

    // Verificar si el email ya está en uso
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado' });
      return;
    }

    // Hashear la contraseña (10 rounds es el estándar recomendado para buen balance seguridad/performance)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol,
        sedeId: rol === 'OPERADOR' ? sedeId : null, // ADMIN no requiere sede
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
      message: 'Usuario registrado exitosamente',
      data: newUser,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Prevención de Timing Attack:
    // Siempre evaluamos el hash, incluso si el usuario no existe.
    // Esto asegura que la petición siempre tarde aprox. lo mismo (~100ms),
    // haciendo imposible para un atacante enumerar correos midiendo tiempos.
    const isMatch = await bcrypt.compare(password, user ? user.password : dummyHash);

    // Mensaje genérico: Nunca decir "El usuario no existe" o "La contraseña es incorrecta"
    if (!user || !isMatch) {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      return;
    }

    // Generar Token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        sedeId: user.sedeId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          sedeId: user.sedeId,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
