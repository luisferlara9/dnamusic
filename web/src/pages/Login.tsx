import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Lock, Mail, Disc, Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Equalizer animation states
  const [bars, setBars] = useState<number[]>(Array(10).fill(20));

  useEffect(() => {
    // Randomize equalizer bars periodically
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 10 + Math.random() * 80));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        
        // Show success cyber-alert
        await MySwal.fire({
          title: <span className="neon-text font-bold">¡Acceso Concedido!</span>,
          html: `<p class="text-brand-300">Bienvenido a la red central de DNA Music, ${response.data.data.user.nombre}.</p>`,
          icon: 'success',
          background: '#18181b', // dark-surface
          confirmButtonText: 'Entrar a la matriz',
          customClass: { confirmButton: 'btn-neon', popup: 'glass-card border-brand-500/50' },
          timer: 2000,
          showConfirmButton: false
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error de conexión con la matriz';
      MySwal.fire({
        title: <span className="text-red-400 font-bold">Acceso Denegado</span>,
        text: errorMsg,
        icon: 'error',
        background: '#18181b',
        confirmButtonText: 'Reintentar',
        customClass: { confirmButton: 'bg-red-600 px-6 py-2 rounded-xl text-white font-bold', popup: 'glass-card border-red-500/50' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-bg">
      {/* Background Animated Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Background Equalizer */}
      <div className="absolute bottom-0 left-0 w-full h-32 flex items-end justify-center gap-1 sm:gap-2 opacity-20 pointer-events-none">
        {bars.map((height, i) => (
          <motion.div 
            key={i}
            className="w-4 sm:w-8 bg-gradient-to-t from-brand-500 to-neon-purple rounded-t-sm"
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden group">
          {/* Top glowing line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-neon-purple to-brand-400"></div>
          
          <div className="text-center mb-10 relative">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-bg border border-brand-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] mb-4 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Disc size={40} className="text-brand-400" />
              <div className="absolute inset-2 border-2 border-dashed border-neon-purple/30 rounded-full"></div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black tracking-tighter text-white"
            >
              DNA <span className="neon-text">MUSIC</span>
            </motion.h1>
            <p className="text-brand-200/60 mt-2 font-medium tracking-widest text-sm uppercase">Portal del Sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-400 group-focus-within/input:text-neon-purple transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-cyber pl-11"
                  placeholder="ID de Operador (Email)"
                  required
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-400 group-focus-within/input:text-neon-purple transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-cyber pl-11 pr-11 ${!showPassword ? 'tracking-widest' : ''}`}
                  placeholder="Código de Acceso"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors focus:outline-none"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-neon flex justify-center items-center gap-2 group/btn"
              >
                {isLoading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <LogIn size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    <span>INICIAR SESIÓN</span>
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
