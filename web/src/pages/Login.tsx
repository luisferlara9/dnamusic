import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Music, LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const MySwal = withReactContent(Swal);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        navigate('/dashboard');
      }
    } catch (error: any) {
      MySwal.fire({
        icon: 'error',
        title: 'Error de acceso',
        text: error.response?.data?.message || 'Credenciales inválidas',
        confirmButtonColor: '#0ea5e9',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-500">
      {/* Background animated elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 dark:bg-brand-500/10 blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-500/10 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-10 relative overflow-hidden">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500"></div>
          
          <div className="flex flex-col items-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 mb-4"
            >
              <Music size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
              DNA Music
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">
              Sistema de Gestión de Estudiantes y Sedes
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@dnamusic.co"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-8"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Ingresar al sistema
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Prueba Técnica — Desarrollador Backend Jr.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
