import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Edit2, Trash2, Search, Music2, Users, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EstudianteForm from '../components/EstudianteForm';
import EstudiantePerfil from '../components/EstudiantePerfil';

export interface Estudiante {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  documentoIdentidad: string;
  sedeId: number;
  programa: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'RETIRADO';
  fechaInscripcion: string;
  fechaInactividad?: string;
  fechaRetiro?: string;
  fechaReintegro?: string;
  fotoPerfil?: string;
  sede?: { nombre: string; ciudad: string };
}

const ESTADO_STYLE = {
  ACTIVO:   'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10',
  INACTIVO: 'border-brand-500/50 text-brand-400 bg-brand-500/10',
  RETIRADO: 'border-pink-500/50 text-pink-400 bg-pink-500/10',
};

const DOT_STYLE = {
  ACTIVO:   'bg-neon-cyan animate-pulse',
  INACTIVO: 'bg-brand-400',
  RETIRADO: 'bg-pink-500',
};

// Iniciales o Foto del avatar
function Avatar({ nombre, fotoUrl, size = 'md' }: { nombre: string; fotoUrl?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dims = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-lg'
  }[size];

  if (fotoUrl) {
    return (
      <div className={`${dims} rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-brand-500/30 ring-2 ring-transparent group-hover:ring-brand-500/50 transition-all duration-300 relative`}>
        <img src={`http://localhost:3000${fotoUrl}`} alt={nombre} className="w-full h-full object-cover" />
      </div>
    );
  }

  const initials = nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div className={`${dims} rounded-2xl bg-gradient-to-br from-brand-600/80 to-neon-purple/60 border border-brand-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)] ring-2 ring-transparent group-hover:ring-brand-500/50 transition-all duration-300`}>
      <span className="font-black text-white">{initials}</span>
    </div>
  );
}

// Ecualizador animado para hover en cards
function HoverEqualizer() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-between px-2 pb-1 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-t-full bg-gradient-to-t from-brand-500 to-neon-cyan"
          animate={{ height: ['10%', `${20 + Math.random() * 80}%`, '10%'] }}
          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

export default function Estudiantes() {
  const { user } = useAuth();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEstudiante, setEditingEstudiante] = useState<Estudiante | null>(null);
  const [perfilEstudiante, setPerfilEstudiante] = useState<Estudiante | null>(null);

  const fetchEstudiantes = async () => {
    try {
      const res = await api.get('/estudiantes');
      if (res.data.success) setEstudiantes(res.data.data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEstudiantes(); }, []);

  const handleDelete = async (id: number, nombre: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar estudiante?',
      html: `<span style="color:#94a3b8">Se eliminará permanentemente el perfil de <strong style="color:white">${nombre}</strong>.</span>`,
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
        await api.delete(`/estudiantes/${id}`);
        setEstudiantes(prev => prev.filter(e => e.id !== id));
        Swal.fire({ title: '✅ Eliminado', text: 'El estudiante fue removido del sistema.', icon: 'success', timer: 1800, showConfirmButton: false, background: '#0f0f1a', color: '#f1f5f9' });
      } catch (error: any) {
        Swal.fire('Error', error.response?.data?.message || 'Hubo un problema.', 'error');
      }
    }
  };

  const openForm = (est?: Estudiante) => {
    setEditingEstudiante(est || null);
    setPerfilEstudiante(null);
    setIsModalOpen(true);
  };

  const closeFormAndReload = (shouldReload = false) => {
    setIsModalOpen(false);
    setEditingEstudiante(null);
    if (shouldReload) fetchEstudiantes();
  };

  const openPerfil = (est: Estudiante) => setPerfilEstudiante(est);
  const closePerfil = () => setPerfilEstudiante(null);

  const filtered = estudiantes.filter(e => {
    const matchSearch =
      e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.documentoIdentidad.includes(searchTerm) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filterEstado === 'TODOS' || e.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div className="w-full">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Music2 size={14} className="text-brand-400" />
            <span className="text-xs font-bold text-brand-400/70 uppercase tracking-widest">DNA Music Academy</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Estudiantes</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {estudiantes.length} talentos registrados en la red
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
          Registrar Nuevo
        </motion.button>
      </div>

      {/* ── Panel principal ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o documento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-surface/50 border border-white/8 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-500 flex-shrink-0" />
            {['TODOS', 'ACTIVO', 'INACTIVO', 'RETIRADO'].map(estado => (
              <button
                key={estado}
                onClick={() => setFilterEstado(estado)}
                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filterEstado === estado
                    ? 'bg-brand-500/20 border border-brand-500/50 text-brand-300'
                    : 'bg-white/5 border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/8'
                }`}
              >
                {estado === 'TODOS' ? 'Todos' : estado.charAt(0) + estado.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Contador */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <Users size={12} className="text-slate-600" />
          <span className="text-xs text-slate-600">
            Mostrando <span className="text-slate-400 font-bold">{filtered.length}</span> de <span className="text-slate-400 font-bold">{estudiantes.length}</span> estudiantes
          </span>
        </div>

        {/* Grid de Estudiantes */}
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="flex items-end gap-1.5 h-10">
                {Array.from({length: 8}).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full bg-brand-500/70"
                    animate={{ height: ['20%', '100%', '20%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>
              <p className="text-brand-300/80 text-sm font-medium tracking-widest uppercase">Cargando base de talentos...</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Music2 size={32} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold text-lg">No se encontraron estudiantes</p>
                    <p className="text-slate-600 text-sm mt-1">Intenta ajustando los filtros de búsqueda</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {filtered.map((est, index) => (
                    <motion.div
                      layout
                      key={est.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative rounded-2xl bg-dark-surface/40 border border-white/10 overflow-hidden backdrop-blur-md hover:border-brand-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex flex-col cursor-pointer"
                      onClick={() => openPerfil(est)}
                    >
                      <HoverEqualizer />

                      {/* Header de la Card */}
                      <div className="p-5 flex items-start justify-between relative z-10 border-b border-white/5">
                        <Avatar nombre={est.nombreCompleto} fotoUrl={est.fotoPerfil} size="lg" />
                        
                        <div className="flex flex-col items-end gap-2">
                          <span 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${ESTADO_STYLE[est.estado]} shadow-lg`}
                            title={
                              est.estado === 'INACTIVO' && est.fechaInactividad ? `Inactivo desde: ${new Date(est.fechaInactividad).toLocaleDateString()}` :
                              est.estado === 'RETIRADO' && est.fechaRetiro ? `Retirado desde: ${new Date(est.fechaRetiro).toLocaleDateString()}` :
                              est.fechaReintegro ? `Reintegrado: ${new Date(est.fechaReintegro).toLocaleDateString()}` :
                              `Inscrito: ${new Date(est.fechaInscripcion).toLocaleDateString()}`
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLE[est.estado]}`} />
                            {est.estado}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">
                            {est.estado === 'INACTIVO' && est.fechaInactividad ? new Date(est.fechaInactividad).toLocaleDateString() :
                             est.estado === 'RETIRADO' && est.fechaRetiro ? new Date(est.fechaRetiro).toLocaleDateString() :
                             est.estado === 'ACTIVO' && est.fechaReintegro ? new Date(est.fechaReintegro).toLocaleDateString() :
                             new Date(est.fechaInscripcion).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Info del Estudiante */}
                      <div className="p-5 flex-1 relative z-10">
                        <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-brand-300 transition-colors line-clamp-1" title={est.nombreCompleto}>
                          {est.nombreCompleto}
                        </h3>
                        <p className="text-xs text-neon-purple font-mono mb-4 tracking-wider">ID: {est.documentoIdentidad}</p>

                        <div className="space-y-2 mb-4">
                          <a href={`mailto:${est.email}`} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors truncate">
                            <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">📧</span>
                            <span className="truncate">{est.email}</span>
                          </a>
                          <a href={`https://wa.me/${est.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">💬</span>
                            {est.telefono}
                          </a>
                        </div>

                        {/* Programa y Sede */}
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Music2 size={12} className="text-brand-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Programa</span>
                          </div>
                          <p className="text-sm font-medium text-slate-200 line-clamp-1" title={est.programa}>{est.programa}</p>
                          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-purple" />
                            <span className="text-xs font-medium text-slate-400">{est.sede?.nombre?.replace('Sede ', '') || 'Sin Sede'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-end gap-2 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(ev) => { ev.stopPropagation(); openForm(est); }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 hover:border-brand-500/60 transition-all text-xs font-bold"
                        >
                          <Edit2 size={12} /> Editar
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(ev) => { ev.stopPropagation(); handleDelete(est.id, est.nombreCompleto); }}
                          className="w-8 h-8 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/60 transition-all flex items-center justify-center"
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Slide-over Form */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <EstudianteForm
            estudiante={editingEstudiante}
            onClose={() => closeFormAndReload()}
            onSuccess={() => closeFormAndReload(true)}
            isAdmin={user?.rol === 'ADMIN'}
          />
        </AnimatePresence>,
        document.body
      )}

      {/* Panel de Perfil */}
      {perfilEstudiante && (
        <EstudiantePerfil
          estudiante={perfilEstudiante}
          onClose={closePerfil}
          onEdit={() => openForm(perfilEstudiante)}
        />
      )}
    </div>
  );
}
