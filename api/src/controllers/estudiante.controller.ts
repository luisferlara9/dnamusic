import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateEstudianteInput, UpdateEstudianteInput } from '../validators/schemas';
import { sendRegistrationEmail } from '../lib/mailer';

/**
 * Función auxiliar para obtener el filtro de sede basado en el rol.
 * ADMIN retorna {} (sin filtro), OPERADOR retorna { sedeId: req.user.sedeId }
 */
const getSedeFilter = (user: AuthRequest['user']) => {
  if (user?.rol === 'ADMIN') return {};
  return { sedeId: user?.sedeId! };
};

// GET /api/estudiantes
export const getEstudiantes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const estudiantes = await prisma.estudiante.findMany({
      where: getSedeFilter(req.user),
      include: {
        sede: {
          select: { nombre: true, ciudad: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: estudiantes });
  } catch (error) {
    console.error('Error en getEstudiantes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/estudiantes/:id
export const getEstudianteById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const estudiante = await prisma.estudiante.findFirst({
      where: {
        id: parseInt(id as string, 10),
        ...getSedeFilter(req.user), // Restricción de sede
      },
      include: {
        sede: {
          select: { nombre: true, ciudad: true },
        },
      },
    });

    if (!estudiante) {
      res.status(404).json({ success: false, message: 'Estudiante no encontrado o sin acceso' });
      return;
    }

    res.status(200).json({ success: true, data: estudiante });
  } catch (error) {
    console.error('Error en getEstudianteById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/estudiantes/programas
export const getProgramas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const grupos = await prisma.estudiante.groupBy({
      by: ['programa'],
      where: { programa: { not: '' } },
      orderBy: { programa: 'asc' },
    });
    const programas = grupos.map(g => g.programa).filter(Boolean);
    res.status(200).json({ success: true, data: programas });
  } catch (error) {
    console.error('Error en getProgramas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/estudiantes
export const createEstudiante = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as CreateEstudianteInput;

    // Validar si el email o documento ya existen
    const existingEstudiante = await prisma.estudiante.findFirst({
      where: {
        OR: [{ email: data.email }, { documentoIdentidad: data.documentoIdentidad }],
      },
    });

    if (existingEstudiante) {
      res.status(400).json({ 
        success: false, 
        message: 'El email o documento de identidad ya están registrados' 
      });
      return;
    }

    // Regla de Negocio: Si es OPERADOR, forzamos que la sede sea la suya.
    // Si es ADMIN, toma la sedeId que viene en el payload (ya validada por Zod).
    const assignedSedeId = req.user?.rol === 'ADMIN' ? data.sedeId : req.user?.sedeId!;

    let fotoPerfilUrl = null;
    if (req.file) {
      fotoPerfilUrl = `/uploads/profiles/${req.file.filename}`;
    }

    const newEstudiante = await prisma.estudiante.create({
      data: {
        ...data,
        sedeId: assignedSedeId,
        fotoPerfil: fotoPerfilUrl,
      },
    });

    // Enviar correo en segundo plano
    sendRegistrationEmail(newEstudiante.email, newEstudiante.nombreCompleto, newEstudiante.documentoIdentidad);

    res.status(201).json({ success: true, message: 'Estudiante creado', data: newEstudiante });
  } catch (error) {
    console.error('Error en createEstudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/estudiantes/:id
export const updateEstudiante = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateEstudianteInput;

    // Verificar existencia Y permisos de sede
    const existingEstudiante = await prisma.estudiante.findFirst({
      where: {
        id: parseInt(id as string, 10),
        ...getSedeFilter(req.user),
      },
    });

    if (!existingEstudiante) {
      res.status(404).json({ success: false, message: 'Estudiante no encontrado o sin acceso' });
      return;
    }

    // Si es operador, no puede cambiar el estudiante a una sede distinta
    if (req.user?.rol === 'OPERADOR' && data.sedeId && data.sedeId !== req.user.sedeId) {
      res.status(403).json({ success: false, message: 'No tienes permiso para transferir estudiantes a otra sede' });
      return;
    }

    // Prevenir duplicidad de email o documento si se están actualizando
    if (data.email || data.documentoIdentidad) {
      const duplicateCheck = await prisma.estudiante.findFirst({
        where: {
          OR: [
            { email: data.email ?? undefined },
            { documentoIdentidad: data.documentoIdentidad ?? undefined },
          ],
          NOT: { id: parseInt(id as string, 10) }, // Excluir el estudiante actual
        },
      });

      if (duplicateCheck) {
        res.status(400).json({ success: false, message: 'El email o documento ya están en uso por otro estudiante' });
        return;
      }
    }

    // Procesamiento de foto
    let fotoPerfilUrl = existingEstudiante.fotoPerfil;
    if (req.file) {
      fotoPerfilUrl = `/uploads/profiles/${req.file.filename}`;
    }

    // Procesamiento de fechas de estado
    let dateUpdates: any = {};
    if (data.estado && data.estado !== existingEstudiante.estado) {
      if (data.estado === 'INACTIVO') dateUpdates.fechaInactividad = new Date();
      if (data.estado === 'RETIRADO') dateUpdates.fechaRetiro = new Date();
      if (data.estado === 'ACTIVO' && (existingEstudiante.estado === 'INACTIVO' || existingEstudiante.estado === 'RETIRADO')) {
        dateUpdates.fechaReintegro = new Date();
      }
    }

    const updatedEstudiante = await prisma.estudiante.update({
      where: { id: parseInt(id as string, 10) },
      data: {
        ...data,
        ...dateUpdates,
        fotoPerfil: fotoPerfilUrl
      },
    });

    res.status(200).json({ success: true, message: 'Estudiante actualizado', data: updatedEstudiante });
  } catch (error) {
    console.error('Error en updateEstudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/estudiantes/:id
export const deleteEstudiante = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar existencia Y permisos de sede antes de eliminar
    const existingEstudiante = await prisma.estudiante.findFirst({
      where: {
        id: parseInt(id as string, 10),
        ...getSedeFilter(req.user),
      },
    });

    if (!existingEstudiante) {
      res.status(404).json({ success: false, message: 'Estudiante no encontrado o sin acceso' });
      return;
    }

    await prisma.estudiante.delete({
      where: { id: parseInt(id as string, 10) },
    });

    res.status(200).json({ success: true, message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteEstudiante:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
