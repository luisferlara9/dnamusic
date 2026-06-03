import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, MapPin, LogOut, Menu, X, Music } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Inicio / Stats' },
    { path: '/dashboard/estudiantes', icon: Users, label: 'Estudiantes' },
    // Solo admin puede gestionar sedes (ejemplo)
    ...(user?.rol === 'ADMIN' ? [{ path: '/dashboard/sedes', icon: MapPin, label: 'Sedes' }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-500 flex relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/10 dark:bg-brand-500/5 blur-[100px] animate-float pointer-events-none"></div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        className="fixed lg:static inset-y-0 left-0 w-72 glass border-r border-slate-200 dark:border-dark-border z-50 lg:transform-none transition-transform duration-300 ease-in-out flex flex-col"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <Music size={20} />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-800 dark:text-white leading-none">DNA Music</h1>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.nombre}</p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-bold uppercase mt-1">{user?.rol}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={() =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-bg"
                    className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-lg shadow-brand-500/20"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'}`} />
                <span className="relative z-10 font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden glass sticky top-0 z-30 px-4 py-4 flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-slate-800 dark:text-white">DNA Music</span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
