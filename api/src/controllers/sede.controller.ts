import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { CreateSedeInput, UpdateSedeInput } from '../validators/schemas';

// GET /api/sedes
export const getSedes = async (req: Request, res: Response): Promise<void> => {
  try {
    const sedes = await prisma.sede.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.status(200).json({ success: true, data: sedes });
  } catch (error) {
    console.error('Error en getSedes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// GET /api/sedes/:id
export const getSedeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sede = await prisma.sede.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!sede) {
      res.status(404).json({ success: false, message: 'Sede no encontrada' });
      return;
    }

    res.status(200).json({ success: true, data: sede });
  } catch (error) {
    console.error('Error en getSedeById:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// POST /api/sedes
export const createSede = async (req: Request<{}, {}, CreateSedeInput>, res: Response): Promise<void> => {
  try {
    const newSede = await prisma.sede.create({
      data: req.body,
    });
    res.status(201).json({ success: true, message: 'Sede creada', data: newSede });
  } catch (error) {
    console.error('Error en createSede:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /api/sedes/:id
export const updateSede = async (req: Request<{ id: string }, {}, UpdateSedeInput>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar existencia
    const existingSede = await prisma.sede.findUnique({ where: { id: parseInt(id, 10) } });
    if (!existingSede) {
      res.status(404).json({ success: false, message: 'Sede no encontrada' });
      return;
    }

    const updatedSede = await prisma.sede.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });

    res.status(200).json({ success: true, message: 'Sede actualizada', data: updatedSede });
  } catch (error) {
    console.error('Error en updateSede:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// DELETE /api/sedes/:id
export const deleteSede = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sedeId = parseInt(id, 10);

    // Verificar existencia
    const existingSede = await prisma.sede.findUnique({ where: { id: sedeId } });
    if (!existingSede) {
      res.status(404).json({ success: false, message: 'Sede no encontrada' });
      return;
    }

    // Verificar si tiene usuarios o estudiantes asociados antes de eliminar
    const estudiantesCount = await prisma.estudiante.count({ where: { sedeId } });
    const usuariosCount = await prisma.user.count({ where: { sedeId } });

    if (estudiantesCount > 0 || usuariosCount > 0) {
      res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar la sede porque tiene estudiantes o usuarios asociados' 
      });
      return;
    }

    await prisma.sede.delete({
      where: { id: sedeId },
    });

    res.status(200).json({ success: true, message: 'Sede eliminada correctamente' });
  } catch (error) {
    console.error('Error en deleteSede:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
