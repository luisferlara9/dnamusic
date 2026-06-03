import { motion } from 'framer-motion';
import StatsCards from '../components/StatsCards';

export default function Dashboard() {
  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Panel de Control</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Resumen general del sistema de gestión DNA Music.
        </p>
      </motion.div>

      <StatsCards />

      {/* Decorative / Empty State for Index */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-12 text-center mt-8 border border-dashed border-slate-300 dark:border-slate-700 bg-transparent shadow-none"
      >
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
          Selecciona un módulo en el menú lateral
        </h3>
        <p className="text-slate-500 dark:text-slate-500 max-w-md mx-auto">
          Desde el menú de la izquierda puedes acceder a la gestión de Estudiantes y (si eres Administrador) a la configuración de Sedes.
        </p>
      </motion.div>
    </div>
  );
}
