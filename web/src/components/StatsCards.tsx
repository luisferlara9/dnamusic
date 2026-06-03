import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, MapPin } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface StatsData {
  totalEstudiantes: number;
  estudiantesActivos: number;
  estudiantesPorSede: {
    sedeId: number;
    sedeNombre: string;
    total: number;
  }[];
}

export default function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo ADMIN puede ver estadísticas completas. Operadores podrían ver algo simplificado o no ver este componente.
    if (user?.rol === 'ADMIN') {
      fetchStats();
    } else {
      setLoading(false); // Operador no carga stats por ahora
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-32 animate-pulse bg-slate-200/50 dark:bg-slate-700/50 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  // Operadores ven un mensaje de bienvenida simplificado
  if (user?.rol === 'OPERADOR') {
    return (
      <div className="glass-card p-8 mb-8 bg-gradient-to-r from-brand-500/10 to-purple-500/10 border-l-4 border-l-brand-500">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Panel de Operador</h2>
        <p className="text-slate-600 dark:text-slate-400">
          Bienvenido al sistema. Aquí puedes gestionar los estudiantes asignados a tu sede exclusivamente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Tarjeta 1: Total Estudiantes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex items-center gap-4 border-b-4 border-b-brand-500"
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center flex-shrink-0">
          <Users size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Estudiantes</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {stats?.totalEstudiantes || 0}
          </p>
        </div>
      </motion.div>

      {/* Tarjeta 2: Estudiantes Activos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 flex items-center gap-4 border-b-4 border-b-emerald-500"
      >
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
          <UserCheck size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Activos</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
            {stats?.estudiantesActivos || 0}
          </p>
        </div>
      </motion.div>

      {/* Tarjeta 3: Desglose por Sede */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 flex items-center gap-4 border-b-4 border-b-purple-500 lg:col-span-1 md:col-span-2"
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center flex-shrink-0">
          <MapPin size={28} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Por Sede</p>
          <div className="space-y-2">
            {stats?.estudiantesPorSede?.map((sede) => (
              <div key={sede.sedeId} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 truncate pr-2">{sede.sedeNombre}</span>
                <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {sede.total}
                </span>
              </div>
            ))}
            {(!stats?.estudiantesPorSede || stats.estudiantesPorSede.length === 0) && (
              <p className="text-xs text-slate-400">No hay datos</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
