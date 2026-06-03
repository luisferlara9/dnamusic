import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-500">
      {/* Top Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
            <span className="font-bold text-lg">D</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-white leading-tight">DNA Music</h1>
            <p className="text-xs text-brand-500 font-medium tracking-wide">PORTAL DE GESTIÓN</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800 dark:text-white">{user?.nombre}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{user?.rol}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 dark:bg-dark-surface dark:hover:bg-red-500/20 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            ¡Bienvenido al Dashboard, {user?.nombre}!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Este es el esqueleto principal del área protegida. Pronto implementaremos aquí los módulos de Estadísticas, Gestión de Estudiantes y Configuración de Sedes.
          </p>
          
          <div className="mt-8 inline-block animate-pulse-slow">
            <span className="px-4 py-2 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-sm font-medium border border-brand-200 dark:border-brand-500/20">
              Módulos en construcción...
            </span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
