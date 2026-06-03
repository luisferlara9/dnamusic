import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// GET /api/stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.rol;
    const userSedeId = req.user?.sedeId;

    if (userRole === 'OPERADOR') {
      if (!userSedeId) {
        res.status(200).json({
          success: true,
          data: {
            totalEstudiantes: 0,
            estudiantesActivos: 0,
            totalSedes: 0,
            sedesActivas: 0,
            totalOperadores: 0,
            estudiantesPorSede: [],
            operadoresPorSede: [],
            estadosEstudiantes: [
              { estado: 'Activos', total: 0, color: '#06b6d4' },
              { estado: 'Inactivos', total: 0, color: '#6366f1' },
              { estado: 'Retirados', total: 0, color: '#a855f7' },
            ],
            estudiantesPorPrograma: [],
          }
        });
        return;
      }

      // Filtrar estadísticas solo para la sede del operador
      const totalEstudiantes = await prisma.estudiante.count({ where: { sedeId: userSedeId } });
      const estudiantesActivos = await prisma.estudiante.count({ where: { sedeId: userSedeId, estado: 'ACTIVO' } });
      const estudiantesInactivos = await prisma.estudiante.count({ where: { sedeId: userSedeId, estado: 'INACTIVO' } });
      const estudiantesRetirados = await prisma.estudiante.count({ where: { sedeId: userSedeId, estado: 'RETIRADO' } });

      // Distribución de estados para su sede
      const estadosEstudiantes = [
        { estado: 'Activos', total: estudiantesActivos, color: '#06b6d4' },
        { estado: 'Inactivos', total: estudiantesInactivos, color: '#6366f1' },
        { estado: 'Retirados', total: estudiantesRetirados, color: '#a855f7' },
      ];

      // Estudiantes por programa en su sede
      const groupedByPrograma = await prisma.estudiante.groupBy({
        by: ['programa'],
        where: { sedeId: userSedeId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });

      const estudiantesPorPrograma = groupedByPrograma.map((group) => ({
        programa: group.programa,
        total: group._count.id,
      }));

      // Nombre de la sede del operador
      const sede = await prisma.sede.findUnique({
        where: { id: userSedeId },
        select: { nombre: true, ciudad: true }
      });

      const estudiantesPorSede = [{
        sedeId: userSedeId,
        sedeNombre: sede?.nombre || 'Mi Sede',
        ciudad: sede?.ciudad || '',
        total: totalEstudiantes,
      }];

      // Operadores en su sede (incluyendo al operador en sí)
      const totalOperadores = await prisma.user.count({
        where: { rol: 'OPERADOR', sedeId: userSedeId }
      });

      // La sede con más estudiantes activos (para OPERADOR es su propia sede si tiene activos)
      const sedeMasActivos = estudiantesActivos > 0 ? {
        sedeId: userSedeId,
        nombre: sede?.nombre || 'Mi Sede',
        ciudad: sede?.ciudad || '',
        totalActivos: estudiantesActivos,
      } : null;

      res.status(200).json({
        success: true,
        data: {
          totalEstudiantes,
          estudiantesActivos,
          totalSedes: 1,
          sedesActivas: sede ? 1 : 0,
          totalOperadores,
          estudiantesPorSede,
          operadoresPorSede: [{
            sedeId: userSedeId,
            sedeNombre: sede?.nombre || 'Mi Sede',
            ciudad: sede?.ciudad || '',
            total: totalOperadores,
          }],
          estadosEstudiantes,
          estudiantesPorPrograma,
          sedeMasActivos,
        }
      });
      return;
    }

    // 1. Totales generales (ADMIN)
    const totalEstudiantes = await prisma.estudiante.count();
    const estudiantesActivos = await prisma.estudiante.count({ where: { estado: 'ACTIVO' } });
    const estudiantesInactivos = await prisma.estudiante.count({ where: { estado: 'INACTIVO' } });
    const estudiantesRetirados = await prisma.estudiante.count({ where: { estado: 'RETIRADO' } });
    const totalSedes = await prisma.sede.count();
    const sedesActivas = await prisma.sede.count({ where: { estado: 'ACTIVA' } });
    const totalOperadores = await prisma.user.count({ where: { rol: 'OPERADOR' } });

    // 2. Estudiantes por sede (con nombre de sede), ordenado de mayor a menor
    const groupedBySede = await prisma.estudiante.groupBy({
      by: ['sedeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const sedes = await prisma.sede.findMany({
      select: { id: true, nombre: true, ciudad: true, estado: true },
    });

    const estudiantesPorSede = groupedBySede.map((group) => {
      const sede = sedes.find((s) => s.id === group.sedeId);
      return {
        sedeId: group.sedeId,
        sedeNombre: sede?.nombre || 'Sede Desconocida',
        ciudad: sede?.ciudad || '',
        total: group._count.id,
      };
    });

    // 3. Operadores por sede (con nombre de sede)
    const operadoresBySede = await prisma.user.groupBy({
      by: ['sedeId'],
      where: { rol: 'OPERADOR', sedeId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const operadoresPorSede = operadoresBySede.map((group) => {
      const sede = sedes.find((s) => s.id === group.sedeId);
      return {
        sedeId: group.sedeId,
        sedeNombre: sede?.nombre || 'Sede Desconocida',
        ciudad: sede?.ciudad || '',
        total: group._count.id,
      };
    });

    // 4. Distribución de estados de estudiantes (para gráfico donut)
    const estadosEstudiantes = [
      { estado: 'Activos', total: estudiantesActivos, color: '#06b6d4' },
      { estado: 'Inactivos', total: estudiantesInactivos, color: '#6366f1' },
      { estado: 'Retirados', total: estudiantesRetirados, color: '#a855f7' },
    ];

    // 5. Estudiantes por programa académico (ordenado de mayor a menor)
    const groupedByPrograma = await prisma.estudiante.groupBy({
      by: ['programa'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const estudiantesPorPrograma = groupedByPrograma.map((group) => ({
      programa: group.programa,
      total: group._count.id,
    }));

    // 6. La sede con más estudiantes activos
    const activeEstudiantesBySede = await prisma.estudiante.groupBy({
      by: ['sedeId'],
      where: { estado: 'ACTIVO' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 1,
    });

    let sedeMasActivos = null;
    if (activeEstudiantesBySede.length > 0) {
      const SedeDb = sedes.find((s) => s.id === activeEstudiantesBySede[0].sedeId);
      sedeMasActivos = {
        sedeId: activeEstudiantesBySede[0].sedeId,
        nombre: SedeDb?.nombre || 'Sede Desconocida',
        ciudad: SedeDb?.ciudad || '',
        totalActivos: activeEstudiantesBySede[0]._count.id
      };
    }

    res.status(200).json({
      success: true,
      data: {
        totalEstudiantes,
        estudiantesActivos,
        totalSedes,
        sedesActivas,
        totalOperadores,
        estudiantesPorSede,
        operadoresPorSede,
        estadosEstudiantes,
        estudiantesPorPrograma,
        sedeMasActivos,
      },
    });
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
