import { useEffect, useState, Component, type ReactNode, type ErrorInfo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Edit2, Trash2, Search, Music2, Users, Shield } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import OperadorForm, { type Operador } from '../components/OperadorForm';
import OperadorPerfil from '../components/OperadorPerfil';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-pink-500/30 bg-pink-500/10 rounded-2xl text-pink-200">
          <h2 className="text-lg font-bold mb-2">Error de Renderizado</h2>
          <p className="text-sm font-mono bg-black/40 p-4 rounded border border-white/5 overflow-x-auto">
            {this.state.error?.toString()}
          </p>
          <p className="text-xs mt-2 text-slate-400">
            Intenta recargar la página o revisa la consola para más detalles.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}


// Estilos de badge de rol
const ROLE_STYLE = {
  ADMIN: 'border-neon-purple/50 text-neon-purple bg-neon-purple/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
  OPERADOR: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(6,182,212,0.2)]',
};

const ROLE_DOT = {
  ADMIN: 'bg-neon-purple',
  OPERADOR: 'bg-neon-cyan animate-pulse',
};

// Generar iniciales del avatar
function Avatar({ nombre }: { nombre: string }) {
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Elegir un degradado según las iniciales
  const charCodeSum = nombre.charCodeAt(0) + (nombre.charCodeAt(1) || 0);
  const gradients = [
    'from-brand-600/80 to-neon-purple/60',
    'from-neon-cyan/80 to-brand-600/60',
    'from-indigo-600/80 to-purple-600/60',
    'from-purple-600/80 to-pink-600/60',
  ];
  const gradient = gradients[charCodeSum % gradients.length];

  return (
    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:border-brand-500/50 group-hover:scale-105 transition-all duration-300`}>
      <span className="font-black text-white text-sm tracking-tighter">{initials}</span>
    </div>
  );
}

// Animación de ecualizador en hover
function HoverEqualizer() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-between px-2 pb-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-t-full bg-gradient-to-t from-brand-500 to-neon-cyan"
          animate={{ height: ['10%', `${20 + Math.random() * 80}%`, '10%'] }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

function Operadores() {
  const { user: currentUser } = useAuth();
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperador, setEditingOperador] = useState<Operador | null>(null);
  const [perfilOperador, setPerfilOperador] = useState<Operador | null>(null);

  const fetchOperadores = async () => {
    try {
      const res = await api.get('/operadores');
      if (res.data.success) {
        setOperadores(res.data.data);
      }
    } catch (error) {
      console.error('Error al cargar operadores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, []);

  const handleDelete = async (id: number, nombre: string) => {
    if (id === currentUser?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Acción inválida',
        text: 'No puedes eliminar tu propia cuenta de administrador en sesión.',
        background: '#0f0f1a',
        color: '#f1f5f9',
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar operador?',
      html: `<span style="color:#94a3b8">Se eliminará permanentemente la cuenta de <strong style="color:white">${nombre}</strong>.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f0f1a',
      color: '#f1f5f9',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#334155',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/operadores/${id}`);
        setOperadores((prev) => prev.filter((o) => o.id !== id));
        Swal.fire({
          title: '✅ Eliminado',
          text: 'El operador fue removido del sistema.',
          icon: 'success',
          timer: 1800,
          showConfirmButton: false,
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Hubo un problema al intentar eliminar.',
          background: '#0f0f1a',
          color: '#f1f5f9',
        });
      }
    }
  };

  const openForm = (op?: Operador) => {
    setEditingOperador(op || null);
    setPerfilOperador(null);
    setIsModalOpen(true);
  };

  const closeFormAndReload = (shouldReload = false) => {
    setIsModalOpen(false);
    setEditingOperador(null);
    if (shouldReload) fetchOperadores();
  };

  const openPerfil = (op: Operador) => setPerfilOperador(op);
  const closePerfil = () => setPerfilOperador(null);

  const filtered = operadores.filter((op) => {
    const nombre = op.nombre || '';
    const email = op.email || '';
    const rol = op.rol || '';
    const sedeNombre = op.sede?.nombre || '';
    
    const matchSearch =
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sedeNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Music2 size={14} className="text-brand-400" />
            <span className="text-xs font-bold text-brand-400/70 uppercase tracking-widest">DNA Music Academy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Operadores & Personal</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {operadores.length} usuarios con credenciales de acceso al sistema
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openForm()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-neon-purple shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all"
        >
          <UserPlus size={18} />
          Registrar Operador
        </motion.button>
      </div>

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, rol o sede..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-surface/50 border border-white/8 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Users size={12} className="text-slate-600" />
            <span>
              Mostrando <span className="text-slate-300 font-bold">{filtered.length}</span> de <span className="text-slate-300 font-bold">{operadores.length}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="flex items-end gap-1.5 h-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-brand-500/70"
                    animate={{ height: ['20%', '100%', '20%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>
              <p className="text-brand-300/80 text-sm font-medium tracking-widest uppercase">
                Conectando con base de personal...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Users size={32} className="text-slate-600" />
              </div>
              <div>
                <p className="text-slate-400 font-bold text-lg">No se encontraron operadores</p>
                <p className="text-slate-600 text-sm mt-1">Intenta ajustando el filtro de búsqueda</p>
              </div>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((op, index) => {
                const isMe = op.id === currentUser?.id;
                return (
                  <motion.div
                    layout
                    key={op.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group relative rounded-2xl bg-dark-surface/40 border border-white/10 overflow-hidden backdrop-blur-md hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
                    onClick={() => openPerfil(op)}
                  >
                    <HoverEqualizer />

                    {/* Card Header */}
                    <div className="p-5 flex items-start justify-between relative z-10 border-b border-white/5">
                      <Avatar nombre={op.nombre} />

                      <div className="flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_STYLE[op.rol]}`}>
                          <span className={`w-1 h-1 rounded-full ${ROLE_DOT[op.rol]}`} />
                          {op.rol}
                        </span>
                        {isMe && (
                          <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest mt-1">
                            Tú (En Sesión)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-5 flex-1 relative z-10 space-y-4">
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug group-hover:text-brand-300 transition-colors line-clamp-1" title={op.nombre}>
                          {op.nombre}
                        </h3>
                        <a href={`mailto:${op.email}`} onClick={(e) => e.stopPropagation()} className="text-xs text-slate-400 hover:text-white transition-colors truncate block mt-0.5">
                          {op.email}
                        </a>
                      </div>

                      {/* Sede Asignada */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield size={12} className="text-brand-400" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Jurisdicción / Sede
                          </span>
                        </div>
                        {op.rol === 'ADMIN' ? (
                          <p className="text-sm font-semibold text-neon-purple">Acceso Global (Toda la Red)</p>
                        ) : op.sede ? (
                          <div>
                            <p className="text-sm font-medium text-slate-200">{op.sede.nombre}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{op.sede.ciudad}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-pink-400 italic">Sede no asignada</p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-end gap-2 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(ev) => { ev.stopPropagation(); openForm(op); }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all text-xs font-bold"
                      >
                        <Edit2 size={12} /> Editar
                      </motion.button>

                      <motion.button
                        whileHover={isMe ? {} : { scale: 1.05 }}
                        whileTap={isMe ? {} : { scale: 0.95 }}
                        disabled={isMe}
                        onClick={(ev) => { ev.stopPropagation(); handleDelete(op.id, op.nombre); }}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                          isMe
                            ? 'border-white/5 bg-white/5 text-slate-600 cursor-not-allowed opacity-40'
                            : 'border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/60'
                        }`}
                        title={isMe ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                      >
                        <Trash2 size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Slide-over Form */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <OperadorForm
            operador={editingOperador}
            onClose={() => closeFormAndReload()}
            onSuccess={() => closeFormAndReload(true)}
          />
        </AnimatePresence>,
        document.body
      )}

      {/* Panel de Perfil */}
      {perfilOperador && (
        <OperadorPerfil
          operador={perfilOperador}
          onClose={closePerfil}
          onEdit={() => openForm(perfilOperador)}
        />
      )}
    </div>
  );
}

export default function OperadoresWithBoundary() {
  return (
    <ErrorBoundary>
      <Operadores />
    </ErrorBoundary>
  );
}
