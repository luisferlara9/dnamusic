import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, MapPin, LogOut, Menu, X, Disc, UserCog } from 'lucide-react';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navLinks = [
    { path: '/dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { path: '/dashboard/estudiantes', label: 'Estudiantes', icon: Users },
  ];

  if (user?.rol === 'ADMIN') {
    navLinks.push({ path: '/dashboard/sedes', label: 'Sedes', icon: MapPin });
    navLinks.push({ path: '/dashboard/operadores', label: 'Operadores', icon: UserCog });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white overflow-hidden flex relative">
      {/* Background Cyber Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/10 blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Holographic */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
          {/* Glowing line bottom */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>
          
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="text-brand-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            >
              <Disc size={32} />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter">
              DNA <span className="neon-text">MUSIC</span>
            </span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="glass-card bg-dark-bg/50 border-white/5 p-4 mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-neon-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-xs text-brand-300 font-bold uppercase tracking-widest mb-1">ID Usuario</p>
            <p className="font-medium truncate text-white">{user?.nombre}</p>
            <div className="mt-2 inline-block px-2 py-1 rounded bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              {user?.rol}
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className="relative block"
                >
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-glow"
                        className="absolute inset-0 bg-brand-500/20 border border-brand-500/50 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon size={20} className={`relative z-10 ${isActive ? 'text-brand-400' : 'group-hover:text-brand-400 transition-colors'}`} />
                    <span className="font-medium relative z-10">{link.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-6 mt-auto border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Desconectar</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass-panel border-b border-white/5 flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-dark-surface/50 rounded-lg border border-white/5 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white hidden sm:block">
              {navLinks.find((l) => location.pathname === l.path || (l.path !== '/dashboard' && location.pathname.startsWith(l.path)))?.label || 'Panel de Control'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-brand-300/60 font-mono hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SISTEMA ONLINE
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative z-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
