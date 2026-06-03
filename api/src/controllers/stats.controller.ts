import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// GET /api/stats
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total de estudiantes
    const totalEstudiantes = await prisma.estudiante.count();

    // 2. Total de estudiantes activos
    const estudiantesActivos = await prisma.estudiante.count({
      where: { estado: 'ACTIVO' },
    });

    // 3. Estudiantes por sede
    // Utilizamos un group by (groupBy) de Prisma para agrupar por sedeId y contar.
    const groupedBySede = await prisma.estudiante.groupBy({
      by: ['sedeId'],
      _count: {
        id: true,
      },
    });

    // Para que los datos sean más legibles, traemos también los nombres de las sedes.
    // Como groupBy devuelve solo sedeId, buscamos las sedes para mapear el ID al nombre real.
    const sedes = await prisma.sede.findMany({
      select: { id: true, nombre: true },
    });

    const estudiantesPorSede = groupedBySede.map((group) => {
      const sede = sedes.find((s) => s.id === group.sedeId);
      return {
        sedeId: group.sedeId,
        sedeNombre: sede?.nombre || 'Sede Desconocida',
        total: group._count.id,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalEstudiantes,
        estudiantesActivos,
        estudiantesPorSede,
      },
    });
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
