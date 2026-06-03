import { motion } from 'framer-motion';
import StatsCards from '../components/StatsCards';
import DashboardCharts from '../components/DashboardCharts';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
              Panel de Control
            </h1>
            <p className="text-slate-500 text-sm">
              {user?.rol === 'ADMIN'
                ? 'Vista global del sistema — todas las sedes y operadores.'
                : 'Resumen de tu cuadrante de operaciones.'}
            </p>
          </div>

          {/* Badge de rol */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20"
          >
            <Activity size={14} className="text-brand-400" />
            <span className="text-xs font-bold text-brand-300 uppercase tracking-widest">
              {user?.rol === 'ADMIN' ? 'Modo Administrador' : 'Modo Operador'}
            </span>
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          </motion.div>
        </div>
      </motion.div>

      {/* Tarjetas de KPIs */}
      <StatsCards />

      {/* Gráficos analíticos (ADMIN y OPERADOR) */}
      {(user?.rol === 'ADMIN' || user?.rol === 'OPERADOR') && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mb-2 mt-2"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-brand-500/40 via-neon-purple/30 to-transparent" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">
              {user.rol === 'ADMIN' ? 'Análisis de Red' : 'Análisis de Sede'}
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-brand-500/40 via-neon-purple/30 to-transparent" />
          </motion.div>

          <DashboardCharts />
        </>
      )}
    </div>
  );
}
